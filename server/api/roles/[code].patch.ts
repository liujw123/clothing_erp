import { z } from 'zod'
import { PERMISSIONS } from '#shared/permissions'
import { updateRole } from '../../services/role'
import { requirePermission } from '../../utils/auth'
import { defineApiHandler } from '../../utils/response'

const roleUpdateSchema = z.object({
  name: z.string().trim().min(1, '请输入角色名称').max(50, '角色名称最多 50 个字符').optional(),
  permissions: z.array(z.string().trim().min(1)).min(1, '角色至少保留一个权限').optional(),
  dataScope: z.enum(['SELF', 'DEPT', 'ALL'], { error: '数据范围只能是 SELF / DEPT / ALL' }).optional(),
  active: z.boolean().optional(),
  remark: z.string().trim().max(500, '备注最多 500 个字符').nullable().optional()
}).strict().refine(
  value => Object.values(value).some(item => item !== undefined),
  '没有需要修改的字段'
)

export default defineApiHandler(async (event) => {
  const current = await requirePermission(event, PERMISSIONS.ADMIN_USER)

  const code = getRouterParam(event, 'code')
  if (!code || !/^[A-Z][A-Z0-9_]{1,29}$/.test(code)) {
    throw createError({ statusCode: 400, statusMessage: '角色编码格式不正确' })
  }

  const body: unknown = await readBody(event)
  const parsed = roleUpdateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? '参数错误'
    })
  }

  return updateRole(code, parsed.data, {
    actorId: current.id,
    ip: getRequestIP(event, { xForwardedFor: true }) ?? null,
    userAgent: getRequestHeader(event, 'user-agent') ?? null
  })
})
