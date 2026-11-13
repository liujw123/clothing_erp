/**
 * RBAC 角色定义。
 * 权限码只描述动作，数据范围独立用 dataScope 表达。
 */
export type DataScope = 'SELF' | 'DEPT' | 'ALL'

export interface RoleDefinition {
  code: string
  name: string
  permissions: string[]
  dataScope: DataScope
}

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    code: 'ADMIN',
    name: '总经理/管理员',
    permissions: ['*'],
    dataScope: 'ALL'
  },
  {
    code: 'DESIGN_MANAGER',
    name: '设计主管',
    permissions: ['style:read', 'style:create', 'style:update', 'task:assign', 'task:approve', 'task:reject'],
    dataScope: 'DEPT'
  },
  {
    code: 'DESIGNER',
    name: '设计师',
    permissions: ['style:read', 'task:submit', 'task:approve', 'task:reject'],
    dataScope: 'SELF'
  },
  {
    code: 'SAMPLE_MANAGER',
    name: '打版主管',
    permissions: ['style:read', 'task:assign', 'task:approve', 'task:reject'],
    dataScope: 'DEPT'
  },
  {
    code: 'SAMPLE_FOLLOWER',
    name: '跟版员',
    permissions: ['style:read', 'task:submit'],
    dataScope: 'SELF'
  },
  {
    code: 'COST_MANAGER',
    name: '核价经理',
    permissions: ['style:read', 'task:assign', 'task:approve', 'task:reject'],
    dataScope: 'DEPT'
  },
  {
    code: 'COST_SPECIALIST',
    name: '核价师',
    permissions: ['style:read', 'task:submit'],
    dataScope: 'SELF'
  },
  {
    code: 'BIZ_MANAGER',
    name: '业务主管',
    permissions: ['style:read', 'order:read', 'order:approve', 'order:change', 'order:suspend', 'task:approve', 'task:reject'],
    dataScope: 'DEPT'
  },
  {
    code: 'BIZ',
    name: '业务员',
    permissions: ['style:read', 'style:create', 'style:update', 'order:read', 'order:create', 'order:change', 'order:suspend', 'task:submit', 'task:approve', 'task:reject'],
    dataScope: 'SELF'
  },
  {
    code: 'FOLLOWER_MANAGER',
    name: '跟单主管',
    permissions: ['style:read', 'task:assign', 'task:approve', 'task:reject', 'order:read', 'order:change'],
    dataScope: 'DEPT'
  },
  {
    code: 'FOLLOWER',
    name: '跟单/PMC',
    permissions: ['style:read', 'task:submit', 'task:approve', 'task:reject', 'order:read', 'order:change'],
    dataScope: 'SELF'
  },
  {
    code: 'QC_MANAGER',
    name: '品控经理',
    permissions: ['style:read', 'order:read', 'task:assign', 'task:approve', 'task:reject'],
    dataScope: 'DEPT'
  },
  {
    code: 'QC',
    name: '质检员',
    permissions: ['style:read', 'order:read', 'task:submit'],
    dataScope: 'SELF'
  },
  {
    code: 'SHIPPER',
    name: '送货员',
    permissions: ['style:read', 'task:submit'],
    dataScope: 'SELF'
  },
  {
    code: 'FINANCE',
    name: '财务',
    permissions: ['style:read', 'order:read', 'task:approve', 'task:reject'],
    dataScope: 'ALL'
  }
]
