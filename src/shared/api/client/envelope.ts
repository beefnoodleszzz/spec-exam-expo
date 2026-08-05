/**
 * Legacy response envelope parser.
 *
 * The backend returns a non-standard envelope:
 * { status: boolean, data: T, total?: number, code?: number, StatusCode?: number, message?: string }
 *
 * Business failures still return HTTP 200 with status: false.
 */
import {
  createBusinessError,
  createUnauthorizedError,
  type AppError,
} from '../errors/app-error'

export interface LegacyEnvelope<T> {
  status?: boolean
  data?: T
  total?: number
  code?: number | string
  StatusCode?: number | string
  message?: string
}

export interface PaginatedResult<T> {
  total: number
  dataList: T[]
}

/**
 * Parse the standard paginated response that many endpoints return.
 */
export interface LegacyPaginatedEnvelope<T> extends LegacyEnvelope<PaginatedResult<T>> {
  total?: number
  dataList?: T[]
}

/**
 * Unwrap the legacy envelope and throw structured AppError on business failures.
 * Call this inside the custom mutator after parsing JSON.
 *
 * Returns the unwrapped data (or throws AppError).
 */
export function parseEnvelope<T>(raw: unknown): T {
  // If not an object at all, return as-is (binary, plain text, etc.)
  if (typeof raw !== 'object' || raw === null) {
    return raw as T
  }

  const envelope = raw as LegacyEnvelope<T>

  // If status field is not boolean, treat as raw data (non-enveloped response)
  if (typeof envelope.status !== 'boolean') {
    return raw as T
  }

  if (envelope.status === true) {
    // Paginated response
    if (envelope.total != null || envelope.total === 0) {
      return { total: envelope.total, data: envelope.data } as T
    }
    // Normal response
    return envelope.data as T
  }

  // status === false means business error
  const code = envelope.code ?? envelope.StatusCode
  const codeNum = typeof code === 'string' ? parseInt(code, 10) : (code ?? 0)

  if (codeNum === 401) {
    throw createUnauthorizedError()
  }

  const message = envelope.message ?? '操作失败'
  const codeStr = code != null ? String(code) : undefined
  throw createBusinessError(message, codeStr, false) satisfies AppError
}
