/**
 * Custom Orval Mutator — single HTTP transport used by all generated endpoints.
 *
 * Responsibilities:
 * 1. Resolve target host (business API vs map API).
 * 2. Attach auth token from sessionStore & examTypeId from appStore (single source of truth).
 * 3. Compute random1, random2, checkResult signature headers using AppConfig.LEGACY_CHECK_KEY.
 * 4. Apply default request timeout (15s) with custom timeoutMs support.
 * 5. Handle responseType: 'arraybuffer' vs 'json'.
 * 6. Unwrap legacy envelope via parseEnvelope (JSON only).
 * 7. Call registered onUnauthorized handler on 401 without direct store coupling.
 * 8. Throw typed AppError on failure.
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
import { appStore } from '@/shared/auth/app-store'

let onUnauthorizedHandler: (() => void) | null = null

/**
 * Register an abstract unauthorized (401) handler.
 * Keeps HTTP transport decoupled from direct Zustand store mutations.
 */
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorizedHandler = handler
}

function resolveHost(url: string): string {
  if (url.includes('vehicleComponent') || url.includes('vcomponent')) {
    return AppConfig.MAP_BASE_URL
  }
  return AppConfig.API_BASE_URL
}

function buildAuthHeaders(): Record<string, string> {
  const accessToken = sessionStore.getState().accessToken
  const examTypeId = appStore.getState().currentExamProfile?.examTypeId

  const random1 = Math.floor(Math.random() * 100)
  const random2 = Math.floor(Math.random() * 100)
  // Create a copy of the key bytes — FuckingDSign mutates the array in place
  const keyBytes = stringToByte(AppConfig.LEGACY_CHECK_KEY)
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
  timeoutMs?: number
  responseType?: 'json' | 'arraybuffer'
}

/**
 * Main request function — used as Orval mutator.
 */
export async function request<T>(options: RequestOptions): Promise<T> {
  const {
    url,
    method,
    params,
    data,
    signal,
    timeoutMs = 15_000,
    responseType = 'json',
  } = options

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

  // Setup timeout controller
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  // Listen to external signal if provided
  if (signal) {
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener('abort', () => controller.abort())
    }
  }

  let response: Response
  try {
    const fetchInit: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    }

    if (body != null) {
      fetchInit.body = body
    }

    response = await fetch(fullUrl, fetchInit)
  } catch (error: unknown) {
    const isTimeout = controller.signal.aborted
    const message = isTimeout
      ? '请求超时，请检查网络后再试'
      : error instanceof Error && error.name === 'AbortError'
      ? '请求已取消'
      : '网络连接失败，请检查网络'

    throw createNetworkError(message) satisfies AppError
  } finally {
    clearTimeout(timeoutId)
  }

  // Handle 401 Unauthorized
  if (response.status === 401) {
    if (onUnauthorizedHandler) {
      onUnauthorizedHandler()
    }
    throw createUnauthorizedError() satisfies AppError
  }

  // Handle HTTP status errors
  if (!response.ok) {
    let message = `服务器错误 (${response.status})`
    try {
      const errBody = (await response.json()) as { message?: string }
      if (errBody?.message) message = errBody.message
    } catch {
      // ignore
    }
    throw createServerError(response.status, message) satisfies AppError
  }

  // Handle Binary Response (arraybuffer)
  if (responseType === 'arraybuffer') {
    const buffer = await response.arrayBuffer()
    return buffer as unknown as T
  }

  // Handle JSON Response Body
  let raw: unknown
  try {
    raw = await response.json()
  } catch {
    raw = null
  }

  // Unwrap legacy envelope (may throw AppError for business failures)
  return parseEnvelope<T>(raw)
}
