import { getRouterParam } from 'h3'
import { getFlowTemplate } from '../../services/flow-template'
import { requirePermission } from '../../utils/auth'
import { defineApiHandler } from '../../utils/response'

export default defineApiHandler(async (event) => {
  await requirePermission(event, 'admin:template')

  const code = getRouterParam(event, 'code')
  if (!code) {
    throw createError({ statusCode: 400, statusMessage: '缺少模板编码' })
  }

  const template = await getFlowTemplate(code)
  if (!template) {
    throw createError({ statusCode: 404, statusMessage: '模板不存在' })
  }

  return template
})
