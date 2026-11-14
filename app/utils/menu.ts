import type { PermissionCode } from '#shared/permissions'
import { PERMISSIONS, hasPermission } from '#shared/permissions'

export interface MenuItem {
  label: string
  to: string
  icon: string
  disabled?: boolean
  permission?: PermissionCode
}

export interface MenuGroup {
  label?: string
  items: MenuItem[]
}

export const MENU_GROUPS: MenuGroup[] = [
  {
    items: [
      { label: '工作台', to: '/', icon: 'i-lucide-layout-dashboard' }
    ]
  },
  {
    label: '业务',
    items: [
      { label: '客户管理', to: '/customers', icon: 'i-lucide-building-2', permission: PERMISSIONS.STYLE_READ },
      { label: '款管理', to: '/styles', icon: 'i-lucide-shirt', disabled: true, permission: PERMISSIONS.STYLE_READ },
      { label: '任务中心', to: '/tasks', icon: 'i-lucide-list-checks', disabled: true },
      { label: '订单管理', to: '/orders', icon: 'i-lucide-shopping-cart', disabled: true, permission: PERMISSIONS.ORDER_READ }
    ]
  },
  {
    label: '系统',
    items: [
      { label: '角色管理', to: '/roles', icon: 'i-lucide-shield-check', permission: PERMISSIONS.ADMIN_USER },
      { label: '用户管理', to: '/users', icon: 'i-lucide-users', disabled: true, permission: PERMISSIONS.ADMIN_USER },
      { label: '流程模板', to: '/templates', icon: 'i-lucide-workflow', permission: PERMISSIONS.ADMIN_TEMPLATE }
    ]
  }
]

export const MENU_ITEMS = MENU_GROUPS.flatMap(group => group.items)

export function isMenuVisible(item: MenuItem, permissions: readonly string[]) {
  return !item.permission || hasPermission(permissions, item.permission)
}
