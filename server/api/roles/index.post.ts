import { z } from 'zod'
import { PERMISSIONS } from '#shared/permissions'
import { createRole } from '../../services/role'
import { requirePermission } from '../../utils/auth'
import { defineApiHandler } from '../../utils/response'

const roleCreateSchema = z.object({
  code: z.string()
    .trim()
    .min(2, '角色编码至少 2 个字符')
    .max(30, '角色编码最多 30 个字符')
    .regex(/^[A-Za-z][A-Za-z0-9_]{1,29}$/, '角色编码需以字母开头，只能包含字母、数字和下划线')
    .transform(value => value.toUpperCase()),
  name: z.string().trim().min(1, '请输入角色名称').max(50, '角色名称最多 50 个字符'),
  permissions: z.array(z.string().trim().min(1)).min(1, '角色至少保留一个权限'),
  dataScope: z.enum(['SELF', 'DEPT', 'ALL'], { error: '数据范围只能是 SELF / DEPT / ALL' }),
  active: z.boolean().optional().default(true),
  remark: z.string().trim().max(500, '备注最多 500 个字符').nullable().optional()
}).strict()

export default defineApiHandler(async (event) => {
  const current = await requirePermission(event, PERMISSIONS.ADMIN_USER)

  const body: unknown = await readBody(event)
  const parsed = roleCreateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? '参数错误'
    })
  }

  const role = await createRole(parsed.data, {
    actorId: current.id,
    ip: getRequestIP(event, { xForwardedFor: true }) ?? null,
    userAgent: getRequestHeader(event, 'user-agent') ?? null
  })

  setResponseStatus(event, 201)
  return role
})
