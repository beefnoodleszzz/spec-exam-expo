import type { RequestOptions } from './request'
import { request } from './request'

export async function orvalRequest<T>(
  url: string,
  config: Record<string, unknown> & { method: string },
): Promise<T> {
  let headers: Record<string, string> | undefined

  if (config.headers) {
    if (Array.isArray(config.headers)) {
      headers = Object.fromEntries(config.headers)
    } else if (typeof config.headers === 'object') {
      headers = config.headers as Record<string, string>
    }
  }

  const options: RequestOptions = {
    url,
    method: config.method as RequestOptions['method'],
    responseType: 'json',
  }

  if (headers) {
    options.headers = headers
  }

  if (config.body !== undefined) {
    options.data = config.body
  } else if (config.data !== undefined) {
    options.data = config.data
  }

  if (config.signal) {
    options.signal = config.signal as AbortSignal
  }

  return request<T>(options)
}
