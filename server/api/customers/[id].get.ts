import { getRouterParam } from 'h3'
import { getCustomer } from '../../services/customer'
import { requirePermission } from '../../utils/auth'
import { defineApiHandler } from '../../utils/response'

export default defineApiHandler(async (event) => {
  await requirePermission(event, 'style:read')

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: '缺少客户 ID' })
  }

  const customer = await getCustomer(id)
  if (!customer) {
    throw createError({ statusCode: 404, statusMessage: '客户不存在' })
  }

  return customer
})
