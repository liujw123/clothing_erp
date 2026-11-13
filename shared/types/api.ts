export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

export interface ApiErrorResponse {
  code: number
  data: null
  message: string
}
