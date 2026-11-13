import type { H3Event } from 'h3'
import { defineEventHandler, getResponseStatus, setResponseStatus } from 'h3'
import type { ApiErrorResponse, ApiResponse } from '#shared/types/api'

interface ErrorLike {
  statusCode?: unknown
  statusMessage?: unknown
  message?: unknown
}

function toStatusCode(error: unknown) {
  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    const statusCode = Number((error as ErrorLike).statusCode)
    if (Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599) {
      return statusCode
    }
  }
  return 500
}

function toErrorMessage(error: unknown, statusCode: number) {
  if (typeof error === 'object' && error !== null) {
    const record = error as ErrorLike
    if (typeof record.statusMessage === 'string' && record.statusMessage) {
      return record.statusMessage
    }
    if (statusCode < 500 && typeof record.message === 'string' && record.message) {
      return record.message
    }
  }
  return statusCode >= 500 ? '服务器内部错误' : '请求失败'
}

/**
 * 统一 API 响应格式：{ code, data, message }。
 * 业务代码继续使用 throw createError(...)，这里负责转成统一错误体。
 */
export function defineApiHandler<T>(handler: (event: H3Event) => Promise<T> | T) {
  return defineEventHandler(async (event): Promise<ApiResponse<T> | ApiErrorResponse> => {
    try {
      const data = await handler(event)
      const statusCode = getResponseStatus(event) || 200
      return {
        code: statusCode,
        data,
        message: 'ok'
      }
    } catch (error) {
      const statusCode = toStatusCode(error)
      if (statusCode >= 500) {
        console.error(`[api] ${event.method} ${event.path}`, error)
      }
      setResponseStatus(event, statusCode)
      return {
        code: statusCode,
        data: null,
        message: toErrorMessage(error, statusCode)
      }
    }
  })
}
