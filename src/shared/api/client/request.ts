/**
 * Custom Orval Mutator — the single HTTP transport used by all generated endpoints.
 *
 * Responsibilities (in order):
 * 1. Resolve the correct host based on URL pattern.
 * 2. Read auth token and examTypeId from the session store (never from params).
 * 3. Compute random1, random2, checkResult headers.
 * 4. Execute fetch.
 * 5. Parse the raw response.
 * 6. Unwrap the legacy envelope.
 * 7. Throw typed AppError on any failure.
 *
 * Prohibitions:
 * - Must NOT show Toast or UI.
 * - Must NOT navigate.
 * - Must NOT modify Zustand directly.
 * - Must NOT retry automatically.
 */
import { AppConfig } from '@/shared/config/app.config'
import { parseEnvelope } from './envelope'
import {
  createNetworkError,
  createServerError,
  createUnauthorizedError,
  type AppError,
} from '../errors/app-error'
import { FuckingDSign, stringToByte } from '@/shared/utils/signature'
import { sessionStore } from '@/shared/auth/session-store'

type ApiHostKind = 'business' | 'map'

function resolveHost(url: string): string {
  if (url.includes('vehicleComponent') || url.includes('vcomponent')) {
    return AppConfig.MAP_BASE_URL
  }
  return AppConfig.API_BASE_URL
}

function resolveHostKind(url: string): ApiHostKind {
  if (url.includes('vehicleComponent') || url.includes('vcomponent')) {
    return 'map'
  }
  return 'business'
}

function buildAuthHeaders(): Record<string, string> {
  const { accessToken, examTypeId } = sessionStore.getState()

  const random1 = Math.floor(Math.random() * 100)
  const random2 = Math.floor(Math.random() * 100)
  // Create a copy of the key bytes — FuckingDSign mutates the array in place
  const keyBytes = stringToByte(AppConfig.CHECK_KEY)
  const checkResult = FuckingDSign(random1, random2, keyBytes)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    random1: String(random1),
    random2: String(random2),
    checkResult,
  }

  if (accessToken) {
    headers['examtoken'] = accessToken
  }

  if (examTypeId) {
    headers['examTypeId'] = examTypeId
  }

  return headers
}

export type RequestOptions = {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  params?: Record<string, unknown>
  data?: unknown
  signal?: AbortSignal
  responseType?: 'json' | 'arraybuffer'
}

/**
 * Main request function — used as Orval mutator.
 * Exported as `request` as required by orval.config.ts.
 */
export async function request<T>(options: RequestOptions): Promise<T> {
  const { url, method, params, data, signal } = options

  const baseUrl = resolveHost(url)
  let fullUrl = baseUrl + url

  // Append query params for GET/DELETE
  if (params && Object.keys(params).length > 0) {
    const search = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)]),
    )
    fullUrl = `${fullUrl}?${search.toString()}`
  }

  const headers = buildAuthHeaders()
  const body = data != null ? JSON.stringify(data) : undefined

  let response: Response
  try {
    const fetchInit: RequestInit = {
      method,
      headers,
    }

    if (body != null) {
      fetchInit.body = body
    }

    if (signal != null) {
      fetchInit.signal = signal
    }

    response = await fetch(fullUrl, fetchInit)
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? '请求已取消'
        : '网络连接失败，请检查网络'
    throw createNetworkError(message) satisfies AppError
  }

  // Handle HTTP errors
  if (response.status === 401) {
    // Signal the session manager via a well-known event, but DO NOT navigate here
    sessionStore.getState().handleUnauthorized()
    throw createUnauthorizedError() satisfies AppError
  }

  if (!response.ok) {
    let message = `服务器错误 (${response.status})`
    try {
      const errBody = await response.json() as { message?: string }
      if (errBody?.message) message = errBody.message
    } catch {
      // ignore
    }
    throw createServerError(response.status, message) satisfies AppError
  }

  // Parse response body
  let raw: unknown
  try {
    raw = await response.json()
  } catch {
    // Treat non-JSON success as empty data
    raw = null
  }

  // Unwrap legacy envelope (may throw AppError for business failures)
  return parseEnvelope<T>(raw)
}
