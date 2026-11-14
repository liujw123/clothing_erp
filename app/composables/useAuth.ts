import type { PermissionCode } from '#shared/permissions'
import { hasPermission } from '#shared/permissions'
import type { ApiResponse } from '#shared/types/api'
import type { AuthUser } from '#shared/types/auth'

/**
 * 当前登录用户状态。
 * 服务端渲染时通过 useRequestFetch 转发 Cookie，避免刷新后丢失登录态。
 */
export function useAuth() {
  const user = useState<AuthUser | null>('auth:user', () => null)

  async function fetchMe() {
    const requestFetch = useRequestFetch()
    try {
      const response = await requestFetch<ApiResponse<AuthUser>>('/api/users/me')
      user.value = response.data
    } catch {
      user.value = null
    }
    return user.value
  }

  async function login(email: string, password: string) {
    const response = await $fetch<ApiResponse<AuthUser>>('/api/auth/sessions', {
      method: 'POST',
      body: { email, password }
    })
    user.value = response.data
    return response.data
  }

  async function logout() {
    try {
      await $fetch<ApiResponse<null>>('/api/auth/sessions/current', { method: 'DELETE' })
    } finally {
      user.value = null
      await navigateTo('/login')
    }
  }

  function can(code: PermissionCode) {
    return hasPermission(user.value?.permissions ?? [], code)
  }

  return { user, fetchMe, login, logout, can }
}
