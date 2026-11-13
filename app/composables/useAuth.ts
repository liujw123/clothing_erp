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
      user.value = await requestFetch<AuthUser>('/api/users/me')
    } catch {
      user.value = null
    }
    return user.value
  }

  async function login(email: string, password: string) {
    const authUser = await $fetch<AuthUser>('/api/auth/sessions', {
      method: 'POST',
      body: { email, password }
    })
    user.value = authUser
    return authUser
  }

  async function logout() {
    try {
      await $fetch('/api/auth/sessions/current', { method: 'DELETE' })
    } finally {
      user.value = null
      await navigateTo('/login')
    }
  }

  function can(code: string) {
    const permissions = user.value?.permissions ?? []
    return permissions.includes('*') || permissions.includes(code)
  }

  return { user, fetchMe, login, logout, can }
}
