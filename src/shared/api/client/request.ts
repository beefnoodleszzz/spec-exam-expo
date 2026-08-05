/**
 * Custom Orval Mutator — single HTTP transport used by all generated endpoints.
 *
 * Hardened Features:
 * 1. Safe URL joining (joinUrl) avoiding double or missing slashes.
 * 2. Strict query parameter serialization with deep array element validation.
 * 3. Case-insensitive header handling & protected header override prevention.
 * 4. Dynamic Content-Type (skips for GET/HEAD and FormData).
 * 5. Distinct timeout vs external cancellation vs network error handling.
 * 6. Clean AbortSignal listener registration & removal.
 * 7. Decoupled 401 handler for both HTTP 401 and Envelope 200 + code:401.
 * 8. Support for responseType: 'arraybuffer'.
 */
import { AppConfig } from '@/shared/config/app.config'
import { parseEnvelope } from './envelope'
import {
  createNetworkError,
  createServerError,
  createUnauthorizedError,
  createTimeoutError,
  createCancelledError,
  createContractError,
  isUnauthorizedError,
  type AppError,
} from '../errors/app-error'
import { generateLegacyCheckResult, stringToByte } from '@/shared/utils/signature'
import { sessionStore } from '@/shared/auth/session-store'
import { appStore } from '@/shared/auth/app-store'

let onUnauthorizedHandler: (() => void) | null = null

const PROTECTED_HEADERS = new Set([
  'examtoken',
  'examtypeid',
  'random1',
  'random2',
  'checkresult',
])

export type QueryPrimitive = string | number | boolean
export type QueryValue = QueryPrimitive | QueryPrimitive[] | null | undefined

/**
 * Register an abstract unauthorized (401) handler.
 * Keeps HTTP transport decoupled from direct Zustand store mutations.
 */
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorizedHandler = handler
}

/**
 * Safely join base URL and path without double or missing slashes.
 */
export function joinUrl(baseUrl: string, path: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '')
  const cleanPath = path.replace(/^\/+/, '')
  return `${cleanBase}/${cleanPath}`
}

/**
 * Serialize query parameters safely with deep array element validation.
 */
export function serializeQueryParams(params?: Record<string, QueryValue>): string {
  if (!params || Object.keys(params).length === 0) return ''

  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item == null) continue
        if (typeof item === 'object') {
          throw createContractError(`Array item in query parameter '${key}' cannot be a plain object`)
        }
        if (typeof item === 'function') {
          throw createContractError(`Array item in query parameter '${key}' cannot be a function`)
        }
        searchParams.append(key, String(item))
      }
    } else if (typeof value === 'object') {
      throw createContractError(`Query parameter '${key}' cannot be a plain object`)
    } else if (typeof value === 'function') {
      throw createContractError(`Query parameter '${key}' cannot be a function`)
    } else {
      searchParams.append(key, String(value))
    }
  }

  const queryStr = searchParams.toString()
  return queryStr ? `?${queryStr}` : ''
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

  // Create a copy of key bytes — signature function mutates array in place
  const keyBytes = stringToByte(AppConfig.LEGACY_CHECK_KEY)
  const checkResult = generateLegacyCheckResult(random1, random2, keyBytes)

  const headers: Record<string, string> = {
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
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD'
  params?: Record<string, QueryValue>
  data?: unknown
  headers?: Record<string, string>
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
    headers: customHeaders,
    signal,
    timeoutMs = 15_000,
    responseType = 'json',
  } = options

  const baseUrl = resolveHost(url)
  const fullPath = joinUrl(baseUrl, url)
  const queryString = serializeQueryParams(params)
  const fullUrl = fullPath.includes('?') && queryString ? `${fullPath}&${queryString.slice(1)}` : `${fullPath}${queryString}`

  // Check custom headers for protected header override attempts
  if (customHeaders) {
    for (const key of Object.keys(customHeaders)) {
      if (PROTECTED_HEADERS.has(key.toLowerCase())) {
        throw createContractError(`Cannot override protected header: ${key}`)
      }
    }
  }

  const authHeaders = buildAuthHeaders()
  const mergedHeaders: Record<string, string> = {
    ...customHeaders,
    ...authHeaders,
  }

  // Dynamic Content-Type & Body handling
  let body: BodyInit | undefined
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData

  if (method !== 'GET' && method !== 'HEAD' && data != null) {
    if (isFormData) {
      body = data as FormData
      // Do NOT set Content-Type for FormData — React Native handles boundary automatically
      delete mergedHeaders['Content-Type']
      delete mergedHeaders['content-type']
    } else {
      const hasContentType = Object.keys(mergedHeaders).some(
        (k) => k.toLowerCase() === 'content-type',
      )
      if (!hasContentType) {
        mergedHeaders['Content-Type'] = 'application/json'
      }
      body = typeof data === 'string' ? data : JSON.stringify(data)
    }
  }

  // Setup abort controller and timeout tracking
  const controller = new AbortController()
  let didTimeout = false

  const timeoutId = setTimeout(() => {
    didTimeout = true
    controller.abort()
  }, timeoutMs)

  const handleExternalAbort = () => {
    controller.abort()
  }

  if (signal) {
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener('abort', handleExternalAbort)
    }
  }

  let response: Response
  try {
    const fetchInit: RequestInit = {
      method,
      headers: mergedHeaders,
      signal: controller.signal,
    }

    if (body != null) {
      fetchInit.body = body
    }

    response = await fetch(fullUrl, fetchInit)
  } catch (error: unknown) {
    if (didTimeout) {
      throw createTimeoutError() satisfies AppError
    }

    if (signal?.aborted || (error instanceof Error && error.name === 'AbortError')) {
      throw createCancelledError() satisfies AppError
    }

    const message = error instanceof Error ? error.message : undefined
    throw createNetworkError(message) satisfies AppError
  } finally {
    clearTimeout(timeoutId)
    if (signal) {
      signal.removeEventListener('abort', handleExternalAbort)
    }
  }

  // Handle HTTP 401 Unauthorized
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
  try {
    return parseEnvelope<T>(raw)
  } catch (error) {
    // Intercept envelope-level 401 (HTTP 200 + status: false + code: 401)
    if (isUnauthorizedError(error)) {
      if (onUnauthorizedHandler) {
        onUnauthorizedHandler()
      }
    }
    throw error
  }
}
