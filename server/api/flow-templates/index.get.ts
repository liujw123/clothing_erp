import { PERMISSIONS } from '#shared/permissions'
import { requirePermission } from '../../utils/auth'
import { defineApiHandler } from '../../utils/response'
import { listFlowTemplates } from '../../services/flow-template'

export default defineApiHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.ADMIN_TEMPLATE)

  const items = await listFlowTemplates()
  return {
    items,
    total: items.length,
    page: 1,
    pageSize: 20
  }
})
