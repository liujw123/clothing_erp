import { createError } from 'h3'
import { PERMISSIONS, ROLE_DEFINITIONS, toDataScope } from '#shared/permissions'
import type { DataScope } from '#shared/permissions'
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '#shared/types/audit'
import type { RoleDto, RoleSnapshot } from '#shared/types/role'
import { prisma } from '../utils/prisma'
import { createAuditLog } from './audit'

const roleOrder = ROLE_DEFINITIONS.map(role => role.code)
const canonicalPermissions: string[] = Object.values(PERMISSIONS)
const permissionIndex = new Map(canonicalPermissions.map((code, index) => [code, index]))

interface RoleRecord {
  code: string
  name: string
  permissions: unknown
  dataScope: string
  active: boolean
  remark: string | null
  createdAt: Date
  updatedAt: Date
  _count: { users: number }
}

export interface CreateRoleInput {
  code: string
  name: string
  permissions: string[]
  dataScope: DataScope
  active: boolean
  remark?: string | null
}

export interface UpdateRoleInput {
  name?: string
  permissions?: string[]
  dataScope?: DataScope
  active?: boolean
  remark?: string | null
}

export interface UpdateRoleMeta {
  actorId: string
  ip?: string | null
  userAgent?: string | null
}

function readPermissions(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

/** 按 PERMISSIONS 的声明顺序归一化，避免仅顺序变化被误判为一次修改。 */
function normalizePermissions(values: readonly string[]) {
  return [...new Set(values)].sort(
    (a, b) => (permissionIndex.get(a) ?? Number.MAX_SAFE_INTEGER) - (permissionIndex.get(b) ?? Number.MAX_SAFE_INTEGER)
  )
}

function toSnapshot(role: Pick<RoleRecord, 'name' | 'permissions' | 'dataScope' | 'active' | 'remark'>): RoleSnapshot {
  return {
    name: role.name,
    permissions: normalizePermissions(readPermissions(role.permissions)),
    dataScope: toDataScope(role.dataScope),
    active: role.active,
    remark: role.remark
  }
}

function toDto(role: RoleRecord): RoleDto {
  return {
    code: role.code,
    name: role.name,
    permissions: readPermissions(role.permissions),
    dataScope: toDataScope(role.dataScope),
    active: role.active,
    remark: role.remark,
    userCount: role._count.users,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString()
  }
}

function isSameSnapshot(a: RoleSnapshot, b: RoleSnapshot) {
  return a.name === b.name
    && a.dataScope === b.dataScope
    && a.active === b.active
    && a.remark === b.remark
    && a.permissions.length === b.permissions.length
    && a.permissions.every((permission, index) => permission === b.permissions[index])
}

/** Prisma 唯一键冲突；并发创建同一编码时兜底转成 409。 */
function isUniqueViolation(error: unknown) {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && (error as { code?: unknown }).code === 'P2002'
}

/**
 * 角色编辑的硬性保护：
 * - ADMIN 必须保留 `*`、ALL 且启用，避免把管理员锁死
 * - 非管理员角色不能出现 `*`
 * - 任何角色至少保留一个权限码
 */
function assertSnapshotAllowed(code: string, snapshot: RoleSnapshot) {
  if (code === 'ADMIN') {
    const keepsAdmin = snapshot.permissions.length === 1
      && snapshot.permissions[0] === '*'
      && snapshot.dataScope === 'ALL'
      && snapshot.active
    if (!keepsAdmin) {
      throw createError({
        statusCode: 409,
        statusMessage: '管理员角色必须保留全部权限、全部数据范围且保持启用'
      })
    }
    return
  }

  if (snapshot.permissions.includes('*')) {
    throw createError({ statusCode: 400, statusMessage: '只有管理员角色可以拥有全部权限' })
  }
  if (snapshot.permissions.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '角色至少保留一个权限' })
  }

  const allowed = new Set(canonicalPermissions)
  const unknown = snapshot.permissions.filter(permission => !allowed.has(permission))
  if (unknown.length > 0) {
    throw createError({ statusCode: 400, statusMessage: `未知权限码：${unknown.join(', ')}` })
  }
}

export interface RoleListParams {
  page: number
  pageSize: number
  keyword?: string
  status?: 'active' | 'inactive'
}

export interface RoleListResult {
  items: RoleDto[]
  total: number
}

/**
 * 角色数量较少，先按预置顺序排序后在内存中筛选、分页。
 * 后续角色数量增大时，再把排序和分页下推到数据库。
 */
export async function listRoles(params: RoleListParams): Promise<RoleListResult> {
  const roles = await prisma.role.findMany({
    include: {
      _count: {
        select: { users: true }
      }
    }
  })

  const keyword = params.keyword?.trim().toLowerCase()
  const filtered = roles.filter((role) => {
    if (params.status === 'active' && !role.active) {
      return false
    }
    if (params.status === 'inactive' && role.active) {
      return false
    }
    if (!keyword) {
      return true
    }
    return role.code.toLowerCase().includes(keyword)
      || role.name.toLowerCase().includes(keyword)
      || (role.remark ?? '').toLowerCase().includes(keyword)
  })

  const sorted = filtered.sort((a, b) => {
    const aIndex = roleOrder.indexOf(a.code)
    const bIndex = roleOrder.indexOf(b.code)
    const rankDiff = (aIndex === -1 ? roleOrder.length : aIndex) - (bIndex === -1 ? roleOrder.length : bIndex)
    if (rankDiff !== 0) {
      return rankDiff
    }
    // 自定义角色排在预置角色之后，按创建时间稳定排序
    return a.createdAt.getTime() - b.createdAt.getTime() || a.code.localeCompare(b.code)
  })

  const start = (params.page - 1) * params.pageSize
  return {
    items: sorted.slice(start, start + params.pageSize).map(toDto),
    total: sorted.length
  }
}

/**
 * 新增自定义角色并写审计。
 * 角色编码创建后不可修改；ADMIN 为系统保留编码。
 */
export async function createRole(input: CreateRoleInput, meta: UpdateRoleMeta): Promise<RoleDto> {
  const code = input.code.trim().toUpperCase()
  if (code === 'ADMIN') {
    throw createError({ statusCode: 409, statusMessage: 'ADMIN 为系统保留角色编码' })
  }

  const snapshot: RoleSnapshot = {
    name: input.name.trim(),
    permissions: normalizePermissions(input.permissions),
    dataScope: input.dataScope,
    active: input.active,
    remark: input.remark?.trim() || null
  }

  if (!snapshot.name) {
    throw createError({ statusCode: 400, statusMessage: '请输入角色名称' })
  }
  assertSnapshotAllowed(code, snapshot)

  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.role.findUnique({
        where: { code },
        select: { code: true }
      })
      if (existing) {
        throw createError({ statusCode: 409, statusMessage: '角色编码已存在' })
      }

      const created = await tx.role.create({
        data: {
          code,
          name: snapshot.name,
          permissions: snapshot.permissions,
          dataScope: snapshot.dataScope,
          active: snapshot.active,
          remark: snapshot.remark
        },
        include: { _count: { select: { users: true } } }
      })

      await createAuditLog(tx, {
        actorId: meta.actorId,
        action: AUDIT_ACTIONS.CREATE_ROLE,
        entityType: AUDIT_ENTITY_TYPES.ROLE,
        entityId: code,
        after: snapshot,
        ip: meta.ip ?? null,
        userAgent: meta.userAgent ?? null
      })

      return toDto(created)
    })
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw createError({ statusCode: 409, statusMessage: '角色编码已存在' })
    }
    throw error
  }
}

/**
 * 更新角色并在同一事务内写审计。
 * 无字段变化时直接返回当前角色，不产生空审计。
 */
export async function updateRole(code: string, input: UpdateRoleInput, meta: UpdateRoleMeta): Promise<RoleDto> {
  return prisma.$transaction(async (tx) => {
    const current = await tx.role.findUnique({
      where: { code },
      include: { _count: { select: { users: true } } }
    })
    if (!current) {
      throw createError({ statusCode: 404, statusMessage: '角色不存在' })
    }

    const before = toSnapshot(current)
    const after: RoleSnapshot = {
      name: input.name ? input.name.trim() : before.name,
      permissions: normalizePermissions(input.permissions ?? before.permissions),
      dataScope: input.dataScope ?? before.dataScope,
      active: input.active ?? before.active,
      remark: input.remark === undefined ? before.remark : (input.remark?.trim() || null)
    }

    assertSnapshotAllowed(code, after)

    if (isSameSnapshot(before, after)) {
      return toDto(current)
    }

    const updated = await tx.role.update({
      where: { code },
      data: {
        name: after.name,
        permissions: after.permissions,
        dataScope: after.dataScope,
        active: after.active,
        remark: after.remark
      },
      include: { _count: { select: { users: true } } }
    })

    await createAuditLog(tx, {
      actorId: meta.actorId,
      action: AUDIT_ACTIONS.UPDATE_ROLE,
      entityType: AUDIT_ENTITY_TYPES.ROLE,
      entityId: code,
      before,
      after,
      ip: meta.ip ?? null,
      userAgent: meta.userAgent ?? null
    })

    return toDto(updated)
  })
}
