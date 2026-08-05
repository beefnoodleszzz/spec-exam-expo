import type { RequestOptions } from './request'
import { request } from './request'

export interface OrvalRequestConfig {
  url: string
  method: string
  headers?: Record<string, string>
  params?: Record<
    string,
    string | number | boolean |
    readonly (string | number | boolean)[]
  >
  data?: unknown
  signal?: AbortSignal
  responseType?: 'json' | 'arraybuffer'
}

export async function orvalRequest<T>(
  config: OrvalRequestConfig,
): Promise<T> {
  const options: RequestOptions = {
    url: config.url,
    method: config.method as RequestOptions['method'],
    headers: config.headers,
    params: config.params as RequestOptions['params'],
    data: config.data,
    signal: config.signal,
    responseType: config.responseType ?? 'json',
  }

  return request<T>(options)
}
