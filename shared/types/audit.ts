/**
 * 管理操作审计的动作与实体类型。
 * 只追加记录，不提供修改/删除接口。
 */
export const AUDIT_ACTIONS = {
  CREATE_ROLE: 'CREATE_ROLE',
  UPDATE_ROLE: 'UPDATE_ROLE'
} as const

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS]

export const AUDIT_ENTITY_TYPES = {
  ROLE: 'ROLE'
} as const

export type AuditEntityType = typeof AUDIT_ENTITY_TYPES[keyof typeof AUDIT_ENTITY_TYPES]

export interface AuditActorDto {
  id: string
  name: string
  email: string
}

export interface AuditLogDto {
  id: string
  action: string
  entityType: string
  entityId: string
  before: unknown
  after: unknown
  comment: string | null
  ip: string | null
  userAgent: string | null
  createdAt: string
  actor: AuditActorDto
}
