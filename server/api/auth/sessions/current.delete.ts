import { clearAuthCookie } from '../../../utils/auth'

export default defineEventHandler((event) => {
  clearAuthCookie(event)
  setResponseStatus(event, 204)
})
