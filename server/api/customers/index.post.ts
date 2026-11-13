import { z } from 'zod'
import { createCustomer } from '../../services/customer'
import { requirePermission } from '../../utils/auth'
import { defineApiHandler } from '../../utils/response'

const customerSchema = z.object({
  code: z.string().trim().min(1, '请输入客户编码').max(50, '客户编码最多 50 个字符'),
  name: z.string().trim().min(1, '请输入客户名称').max(100, '客户名称最多 100 个字符'),
  country: z.string().trim().max(50, '国家/地区最多 50 个字符').nullable().optional().transform(value => value || null)
})

export default defineApiHandler(async (event) => {
  await requirePermission(event, 'style:create')

  const body: unknown = await readBody(event)
  const parsed = customerSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? '参数错误'
    })
  }

  const customer = await createCustomer(parsed.data)
  setResponseStatus(event, 201)
  return customer
})
