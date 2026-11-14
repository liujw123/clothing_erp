import type { AuditLogDto } from '#shared/types/audit'
import type { Prisma } from '../generated/prisma/client'
import { prisma } from '../utils/prisma'

export interface AuditLogListParams {
  page: number
  pageSize: number
  entityType?: string
  entityId?: string
  action?: string
}

export interface AuditLogListResult {
  items: AuditLogDto[]
  total: number
}

/** 写入审计的入参；before/after 只放必要字段，不存整行敏感数据。 */
export interface AuditLogInput {
  actorId: string
  action: string
  entityType: string
  entityId: string
  before?: unknown
  after?: unknown
  comment?: string | null
  ip?: string | null
  userAgent?: string | null
}

interface AuditLogRecord {
  id: string
  action: string
  entityType: string
  entityId: string
  before: Prisma.JsonValue | null
  after: Prisma.JsonValue | null
  comment: string | null
  ip: string | null
  userAgent: string | null
  createdAt: Date
  actor: {
    id: string
    name: string
    email: string
  }
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

function toDto(log: AuditLogRecord): AuditLogDto {
  return {
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    before: log.before,
    after: log.after,
    comment: log.comment,
    ip: log.ip,
    userAgent: log.userAgent,
    createdAt: log.createdAt.toISOString(),
    actor: log.actor
  }
}

function truncate(value: string | null | undefined, maxLength: number) {
  return value ? value.slice(0, maxLength) : null
}

export async function listAuditLogs(params: AuditLogListParams): Promise<AuditLogListResult> {
  const { page, pageSize, entityType, entityId, action } = params
  const where: Prisma.AuditLogWhereInput = {
    ...(entityType ? { entityType } : {}),
    ...(entityId ? { entityId } : {}),
    ...(action ? { action } : {})
  }

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        actor: {
          select: { id: true, name: true, email: true }
        }
      }
    })
  ])

  return {
    items: logs.map(toDto),
    total
  }
}

/**
 * 审计必须在业务事务内写入：角色更新失败则审计回滚，审计失败则业务回滚。
 */
export async function createAuditLog(tx: Prisma.TransactionClient, input: AuditLogInput) {
  await tx.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      before: input.before === undefined ? undefined : toJsonValue(input.before),
      after: input.after === undefined ? undefined : toJsonValue(input.after),
      comment: truncate(input.comment, 500),
      ip: truncate(input.ip, 64),
      userAgent: truncate(input.userAgent, 512)
    }
  })
}
