interface ApiErrorPayload {
  message?: string
  statusMessage?: string
}

/**
 * 从 $fetch / ofetch 抛出的错误中提取可展示给用户的消息。
 */
export function getApiErrorMessage(error: unknown, fallback = '请求失败，请稍后重试') {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: ApiErrorPayload }).data
    if (typeof data?.message === 'string' && data.message) {
      return data.message
    }
    if (typeof data?.statusMessage === 'string' && data.statusMessage) {
      return data.statusMessage
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
