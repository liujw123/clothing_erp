import type { DataScope } from '../permissions'

export interface RoleDto {
  code: string
  name: string
  permissions: string[]
  dataScope: DataScope
  active: boolean
  remark: string | null
  userCount: number
  createdAt: string
  updatedAt: string
}

/** 角色审计快照：只保存可编辑字段，避免把整行数据写入审计。 */
export interface RoleSnapshot {
  name: string
  permissions: string[]
  dataScope: DataScope
  active: boolean
  remark: string | null
}
