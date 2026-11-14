export type DataScope = 'SELF' | 'DEPT' | 'ALL'

/**
 * 权限码只描述动作，不描述数据范围，也不写角色名。
 * 所有权限判断统一从这里取，避免字符串散落。
 */
export const PERMISSIONS = {
  STYLE_READ: 'style:read', // 查看款
  STYLE_CREATE: 'style:create', // 新建款
  STYLE_UPDATE: 'style:update', // 修改款
  TASK_ASSIGN: 'task:assign', // 分配任务
  TASK_SUBMIT: 'task:submit', // 提交任务
  TASK_APPROVE: 'task:approve', // 通过任务
  TASK_REJECT: 'task:reject', // 驳回任务
  ORDER_READ: 'order:read', // 查看订单
  ORDER_CREATE: 'order:create', // 创建订单
  ORDER_CHANGE: 'order:change', // 发起变更
  ORDER_SUSPEND: 'order:suspend', // 暂停 / 恢复 / 取消
  ORDER_APPROVE: 'order:approve', // 审批订单
  DOC_READ: 'doc:read', // 查看单据
  ADMIN_USER: 'admin:user', // 用户管理
  ADMIN_TEMPLATE: 'admin:template' // 流程模板
} as const

export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS]
export type RolePermission = PermissionCode | '*'

export interface PermissionDefinition {
  code: PermissionCode
  label: string
}

export interface PermissionGroup {
  key: string
  label: string
  permissions: PermissionDefinition[]
}

/** 权限分组用于后续角色管理页展示，不参与后端校验。 */
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: 'style',
    label: '款',
    permissions: [
      { code: PERMISSIONS.STYLE_READ, label: '查看款' },
      { code: PERMISSIONS.STYLE_CREATE, label: '新建款' },
      { code: PERMISSIONS.STYLE_UPDATE, label: '修改款' }
    ]
  },
  {
    key: 'task',
    label: '任务',
    permissions: [
      { code: PERMISSIONS.TASK_ASSIGN, label: '分配任务' },
      { code: PERMISSIONS.TASK_SUBMIT, label: '提交任务' },
      { code: PERMISSIONS.TASK_APPROVE, label: '通过任务' },
      { code: PERMISSIONS.TASK_REJECT, label: '驳回任务' }
    ]
  },
  {
    key: 'order',
    label: '订单',
    permissions: [
      { code: PERMISSIONS.ORDER_READ, label: '查看订单' },
      { code: PERMISSIONS.ORDER_CREATE, label: '创建订单' },
      { code: PERMISSIONS.ORDER_CHANGE, label: '发起变更' },
      { code: PERMISSIONS.ORDER_SUSPEND, label: '暂停/恢复/取消' },
      { code: PERMISSIONS.ORDER_APPROVE, label: '审批订单' }
    ]
  },
  {
    key: 'doc',
    label: '单据',
    permissions: [
      { code: PERMISSIONS.DOC_READ, label: '查看单据' }
    ]
  },
  {
    key: 'admin',
    label: '管理',
    permissions: [
      { code: PERMISSIONS.ADMIN_USER, label: '用户管理' },
      { code: PERMISSIONS.ADMIN_TEMPLATE, label: '流程模板' }
    ]
  }
]

/** 通配符 `*` 只用于管理员。 */
export function hasPermission(permissions: readonly string[], code: PermissionCode) {
  return permissions.includes('*') || permissions.includes(code)
}

export const DATA_SCOPE_RANK: Record<DataScope, number> = {
  SELF: 0,
  DEPT: 1,
  ALL: 2
}

/** 多角色取最宽的数据范围。 */
export function widestDataScope(scopes: readonly DataScope[]): DataScope {
  return scopes.reduce<DataScope>(
    (widest, scope) => DATA_SCOPE_RANK[scope] > DATA_SCOPE_RANK[widest] ? scope : widest,
    'SELF'
  )
}

export function isScopeAtLeast(scope: DataScope, required: DataScope) {
  return DATA_SCOPE_RANK[scope] >= DATA_SCOPE_RANK[required]
}

/** 把数据库里的字符串规范化为 DataScope，非法值按 SELF 处理。 */
export function toDataScope(value: string): DataScope {
  return value === 'ALL' || value === 'DEPT' ? value : 'SELF'
}

export interface RoleDefinition {
  code: string
  name: string
  permissions: RolePermission[]
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
    permissions: [
      PERMISSIONS.STYLE_READ,
      PERMISSIONS.STYLE_CREATE,
      PERMISSIONS.STYLE_UPDATE,
      PERMISSIONS.TASK_ASSIGN,
      PERMISSIONS.TASK_APPROVE,
      PERMISSIONS.TASK_REJECT
    ],
    dataScope: 'DEPT'
  },
  {
    code: 'DESIGNER',
    name: '设计师',
    permissions: [
      PERMISSIONS.STYLE_READ,
      PERMISSIONS.TASK_SUBMIT,
      PERMISSIONS.TASK_APPROVE,
      PERMISSIONS.TASK_REJECT
    ],
    dataScope: 'SELF'
  },
  {
    code: 'SAMPLE_MANAGER',
    name: '打版主管',
    permissions: [
      PERMISSIONS.STYLE_READ,
      PERMISSIONS.TASK_ASSIGN,
      PERMISSIONS.TASK_APPROVE,
      PERMISSIONS.TASK_REJECT
    ],
    dataScope: 'DEPT'
  },
  {
    code: 'SAMPLE_FOLLOWER',
    name: '跟版员',
    permissions: [
      PERMISSIONS.STYLE_READ,
      PERMISSIONS.TASK_SUBMIT
    ],
    dataScope: 'SELF'
  },
  {
    code: 'COST_MANAGER',
    name: '核价经理',
    permissions: [
      PERMISSIONS.STYLE_READ,
      PERMISSIONS.TASK_ASSIGN,
      PERMISSIONS.TASK_APPROVE,
      PERMISSIONS.TASK_REJECT
    ],
    dataScope: 'DEPT'
  },
  {
    code: 'COST_SPECIALIST',
    name: '核价师',
    permissions: [
      PERMISSIONS.STYLE_READ,
      PERMISSIONS.TASK_SUBMIT
    ],
    dataScope: 'SELF'
  },
  {
    code: 'BIZ_MANAGER',
    name: '业务主管',
    permissions: [
      PERMISSIONS.STYLE_READ,
      PERMISSIONS.ORDER_READ,
      PERMISSIONS.ORDER_APPROVE,
      PERMISSIONS.ORDER_CHANGE,
      PERMISSIONS.ORDER_SUSPEND,
      PERMISSIONS.TASK_APPROVE,
      PERMISSIONS.TASK_REJECT
    ],
    dataScope: 'DEPT'
  },
  {
    code: 'BIZ',
    name: '业务员',
    permissions: [
      PERMISSIONS.STYLE_READ,
      PERMISSIONS.STYLE_CREATE,
      PERMISSIONS.STYLE_UPDATE,
      PERMISSIONS.ORDER_READ,
      PERMISSIONS.ORDER_CREATE,
      PERMISSIONS.ORDER_CHANGE,
      PERMISSIONS.ORDER_SUSPEND,
      PERMISSIONS.TASK_SUBMIT,
      PERMISSIONS.TASK_APPROVE,
      PERMISSIONS.TASK_REJECT
    ],
    dataScope: 'SELF'
  },
  {
    code: 'FOLLOWER_MANAGER',
    name: '跟单主管',
    permissions: [
      PERMISSIONS.STYLE_READ,
      PERMISSIONS.TASK_ASSIGN,
      PERMISSIONS.TASK_APPROVE,
      PERMISSIONS.TASK_REJECT,
      PERMISSIONS.ORDER_READ,
      PERMISSIONS.ORDER_CHANGE
    ],
    dataScope: 'DEPT'
  },
  {
    code: 'FOLLOWER',
    name: '跟单/PMC',
    permissions: [
      PERMISSIONS.STYLE_READ,
      PERMISSIONS.TASK_SUBMIT,
      PERMISSIONS.TASK_APPROVE,
      PERMISSIONS.TASK_REJECT,
      PERMISSIONS.ORDER_READ,
      PERMISSIONS.ORDER_CHANGE
    ],
    dataScope: 'SELF'
  },
  {
    code: 'QC_MANAGER',
    name: '品控经理',
    permissions: [
      PERMISSIONS.STYLE_READ,
      PERMISSIONS.ORDER_READ,
      PERMISSIONS.TASK_ASSIGN,
      PERMISSIONS.TASK_APPROVE,
      PERMISSIONS.TASK_REJECT
    ],
    dataScope: 'DEPT'
  },
  {
    code: 'QC',
    name: '质检员',
    permissions: [
      PERMISSIONS.STYLE_READ,
      PERMISSIONS.ORDER_READ,
      PERMISSIONS.TASK_SUBMIT
    ],
    dataScope: 'SELF'
  },
  {
    code: 'SHIPPER',
    name: '送货员',
    permissions: [
      PERMISSIONS.STYLE_READ,
      PERMISSIONS.TASK_SUBMIT
    ],
    dataScope: 'SELF'
  },
  {
    code: 'FINANCE',
    name: '财务',
    permissions: [
      PERMISSIONS.STYLE_READ,
      PERMISSIONS.ORDER_READ,
      PERMISSIONS.TASK_APPROVE,
      PERMISSIONS.TASK_REJECT
    ],
    dataScope: 'ALL'
  }
]
