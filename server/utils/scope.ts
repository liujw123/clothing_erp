import { createError } from 'h3'
import type { AuthUser } from '#shared/types/auth'

export interface ScopeTarget {
  ownerId?: string | null
  deptId?: string | null
}

/**
 * 通用数据范围判断。
 * SELF 看 ownerId，DEPT 看 deptId，ALL 不限制。
 * 具体业务查询仍需在 service 里转成 where 条件。
 */
export function canAccessTarget(user: AuthUser, target: ScopeTarget) {
  if (user.dataScope === 'ALL') {
    return true
  }
  if (user.dataScope === 'DEPT') {
    return Boolean(target.deptId && target.deptId === user.deptId)
  }
  return Boolean(target.ownerId && target.ownerId === user.id)
}

/** 数据范围外统一返回 404，避免泄露资源是否存在。 */
export function requireScopeAccess(user: AuthUser, target: ScopeTarget) {
  if (!canAccessTarget(user, target)) {
    throw createError({ statusCode: 404, statusMessage: '资源不存在' })
  }
}
