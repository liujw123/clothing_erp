import { z } from 'zod'
import { PERMISSIONS } from '#shared/permissions'
import { listCustomers } from '../../services/customer'
import { requirePermission } from '../../utils/auth'
import { defineApiHandler } from '../../utils/response'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  keyword: z.string().trim().optional()
})

export default defineApiHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.STYLE_READ)

  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? '参数错误'
    })
  }

  const { items, total } = await listCustomers(parsed.data)
  return {
    items,
    total,
    page: parsed.data.page,
    pageSize: parsed.data.pageSize
  }
})
