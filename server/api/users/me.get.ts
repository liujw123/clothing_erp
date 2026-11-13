import { requireUser } from '../../utils/auth'
import { defineApiHandler } from '../../utils/response'

export default defineApiHandler(async (event) => {
  return await requireUser(event)
})
