/**
 * AppError — Structured error model for the entire application.
 * HTTP layer must not display UI or navigate — it throws AppError.
 * UI layer handles display and navigation decisions.
 */
export type AppError =
  | {
      type: 'network'
      message: string
      retryable: true
    }
  | {
      type: 'timeout'
      message: string
      retryable: true
    }
  | {
      type: 'unauthorized'
      message: string
      retryable: false
    }
  | {
      type: 'validation'
      message: string
      fields?: Record<string, string>
      retryable: false
    }
  | {
      type: 'business'
      code?: string
      message: string
      retryable: boolean
    }
  | {
      type: 'server'
      status: number
      requestId?: string
      message: string
      retryable: boolean
    }
  | {
      type: 'contract'
      message: string
      details?: unknown
      retryable: false
    }
  | {
      type: 'unknown'
      message: string
      retryable: false
    }

export function isAppError(e: unknown): e is AppError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'type' in e &&
    typeof (e as AppError).type === 'string'
  )
}

export function createNetworkError(message: string): AppError {
  return { type: 'network', message, retryable: true }
}

export function createUnauthorizedError(): AppError {
  return { type: 'unauthorized', message: '请先登录', retryable: false }
}

export function createBusinessError(message: string, code?: string, retryable = false): AppError {
  return {
    type: 'business',
    ...(code != null ? { code } : {}),
    message,
    retryable,
  }
}

export function createServerError(status: number, message: string): AppError {
  return { type: 'server', status, message, retryable: status >= 500 }
}

export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) return error.message
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return '发生未知错误'
}
