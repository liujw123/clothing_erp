import { z } from 'zod'
import { PERMISSIONS } from '#shared/permissions'
import { listRoles } from '../../services/role'
import { requirePermission } from '../../utils/auth'
import { defineApiHandler } from '../../utils/response'

const querySchema = z.object({
  page: z.coerce.number().int().min(1, 'page 最小为 1').default(1),
  pageSize: z.coerce.number().int().min(1, 'pageSize 最小为 1').max(100, 'pageSize 最大为 100').default(10),
  keyword: z.string().trim().max(100).optional().transform(value => value || undefined),
  status: z.enum(['active', 'inactive']).optional()
})

export default defineApiHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.ADMIN_USER)

  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? '参数错误'
    })
  }

  const result = await listRoles(parsed.data)
  return {
    items: result.items,
    total: result.total,
    page: parsed.data.page,
    pageSize: parsed.data.pageSize
  }
})
