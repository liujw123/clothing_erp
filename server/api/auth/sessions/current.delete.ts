import { clearAuthCookie } from '../../../utils/auth'
import { defineApiHandler } from '../../../utils/response'

export default defineApiHandler((event) => {
  clearAuthCookie(event)
  return null
})
