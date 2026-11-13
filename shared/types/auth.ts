import type { DataScope } from '../permissions'

export interface AuthRole {
  code: string
  name: string
  dataScope: DataScope
}

export interface AuthUser {
  id: string
  email: string
  name: string
  phone: string | null
  gender: string | null
  deptId: string | null
  roles: AuthRole[]
  permissions: string[]
  dataScope: DataScope
  createdAt: string
}
