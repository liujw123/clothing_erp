import { defineApiHandler } from '../utils/response'

export default defineApiHandler(() => {
  throw createError({ statusCode: 404, statusMessage: '接口不存在' })
})
