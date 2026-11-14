import type { H3Event } from 'h3'
import { createError, deleteCookie, getCookie, setCookie } from 'h3'
import { SignJWT, jwtVerify } from 'jose'
import type { PermissionCode } from '#shared/permissions'
import { hasPermission, toDataScope, widestDataScope } from '#shared/permissions'
import type { AuthUser } from '#shared/types/auth'
import { prisma } from './prisma'

const COOKIE_NAME = 'erp_token'
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7

interface UserRoleRecord {
  role: {
    code: string
    name: string
    permissions: unknown
    dataScope: string
    active: boolean
  }
}

interface UserWithRoles {
  id: string
  email: string
  name: string
  phone: string | null
  gender: string | null
  deptId: string | null
  active: boolean
  createdAt: Date
  roles: UserRoleRecord[]
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (secret) {
    return new TextEncoder().encode(secret)
  }

  // 开发环境允许缺省值；生产环境必须显式配置
  if (process.env.NODE_ENV !== 'production') {
    return new TextEncoder().encode('dev-only-secret-change-me')
  }

  throw createError({ statusCode: 500, statusMessage: '服务端未配置 JWT_SECRET' })
}

function readPermissions(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.filter((item): item is string => typeof item === 'string')
}

export function signToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret())
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ['HS256'] })
  if (typeof payload.sub !== 'string' || !payload.sub) {
    throw new Error('invalid token subject')
  }
  return payload.sub
}

export function setAuthCookie(event: H3Event, token: string) {
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TOKEN_TTL_SECONDS
  })
}

export function clearAuthCookie(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function toAuthUser(user: UserWithRoles): AuthUser {
  const activeRoles = user.roles.filter(userRole => userRole.role.active)
  const roles = activeRoles.map(userRole => ({
    code: userRole.role.code,
    name: userRole.role.name,
    dataScope: toDataScope(userRole.role.dataScope)
  }))
  const permissions = [...new Set(activeRoles.flatMap(userRole => readPermissions(userRole.role.permissions)))]
  const dataScope = widestDataScope(roles.map(role => role.dataScope))

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    gender: user.gender,
    deptId: user.deptId,
    roles,
    permissions,
    dataScope,
    createdAt: user.createdAt.toISOString()
  }
}

export async function requireUser(event: H3Event): Promise<AuthUser> {
  const token = getCookie(event, COOKIE_NAME)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }

  let userId: string
  try {
    userId = await verifyToken(token)
  } catch {
    clearAuthCookie(event)
    throw createError({ statusCode: 401, statusMessage: '登录已过期，请重新登录' })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } }
  })

  if (!user || !user.active) {
    clearAuthCookie(event)
    throw createError({ statusCode: 401, statusMessage: '账号不可用' })
  }

  return toAuthUser(user)
}

export async function requirePermission(event: H3Event, code: PermissionCode): Promise<AuthUser> {
  const user = await requireUser(event)
  if (!hasPermission(user.permissions, code)) {
    throw createError({ statusCode: 403, statusMessage: '无权限' })
  }
  return user
}
