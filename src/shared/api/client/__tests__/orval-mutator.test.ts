import { describe, it, expect, beforeEach, vi } from 'vitest'
import { orvalRequest } from '../orval-mutator'
import * as requestModule from '../request'

vi.mock('../request')

describe('orvalRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return HTTP response wrapper with data, status, and headers', async () => {
    const mockData = { id: 'user-1', name: 'Test User' }
    const mockHeaders = new Headers({ 'content-type': 'application/json' })

    vi.spyOn(requestModule, 'requestWithMetadata').mockResolvedValue({
      data: mockData,
      status: 200,
      headers: mockHeaders,
    })

    const result = await orvalRequest<{ data: typeof mockData; status: number; headers: Headers }>(
      '/api/user',
      { method: 'GET' },
    )

    expect(result).toEqual({
      data: mockData,
      status: 200,
      headers: mockHeaders,
    })
  })

  it('should forward body in data field', async () => {
    const mockData = { success: true }
    const mockHeaders = new Headers()

    vi.spyOn(requestModule, 'requestWithMetadata').mockResolvedValue({
      data: mockData,
      status: 200,
      headers: mockHeaders,
    })

    await orvalRequest<{ data: typeof mockData; status: number; headers: Headers }>(
      '/api/login',
      {
        method: 'POST',
        body: { phone: '13800000000' },
      },
    )

    const mockFn = vi.mocked(requestModule.requestWithMetadata)
    const callArgs = mockFn.mock.calls[0]?.[0]
    expect(callArgs?.data).toEqual({ phone: '13800000000' })
  })

  it('should forward signal for request cancellation', async () => {
    const controller = new AbortController()
    const mockHeaders = new Headers()

    vi.spyOn(requestModule, 'requestWithMetadata').mockResolvedValue({
      data: {},
      status: 200,
      headers: mockHeaders,
    })

    await orvalRequest<{ data: unknown; status: number; headers: Headers }>(
      '/api/user',
      {
        method: 'GET',
        signal: controller.signal,
      },
    )

    const mockFn = vi.mocked(requestModule.requestWithMetadata)
    const callArgs = mockFn.mock.calls[0]?.[0]
    expect(callArgs?.signal).toBe(controller.signal)
  })

  it('should handle custom headers', async () => {
    const mockHeaders = new Headers()

    vi.spyOn(requestModule, 'requestWithMetadata').mockResolvedValue({
      data: {},
      status: 200,
      headers: mockHeaders,
    })

    await orvalRequest<{ data: unknown; status: number; headers: Headers }>(
      '/api/data',
      {
        method: 'GET',
        headers: [['x-custom', 'value']],
      },
    )

    const mockFn = vi.mocked(requestModule.requestWithMetadata)
    const callArgs = mockFn.mock.calls[0]?.[0]
    expect(callArgs?.headers).toEqual({ 'x-custom': 'value' })
  })

  it('should use POST method from config', async () => {
    const mockHeaders = new Headers()

    vi.spyOn(requestModule, 'requestWithMetadata').mockResolvedValue({
      data: {},
      status: 201,
      headers: mockHeaders,
    })

    await orvalRequest<{ data: unknown; status: number; headers: Headers }>(
      '/api/resource',
      {
        method: 'POST',
        body: { name: 'New Resource' },
      },
    )

    const mockFn = vi.mocked(requestModule.requestWithMetadata)
    const callArgs = mockFn.mock.calls[0]?.[0]
    expect(callArgs?.method).toBe('POST')
    expect(callArgs?.data).toEqual({ name: 'New Resource' })
  })

  it('should preserve response status code', async () => {
    const mockHeaders = new Headers()

    vi.spyOn(requestModule, 'requestWithMetadata').mockResolvedValue({
      data: { id: '123' },
      status: 404,
      headers: mockHeaders,
    })

    const result = await orvalRequest<{ data: { id: string }; status: number; headers: Headers }>(
      '/api/notfound',
      { method: 'GET' },
    )

    expect(result.status).toBe(404)
  })

  it('should preserve response headers', async () => {
    const customHeader = 'x-rate-limit-remaining'
    const customValue = '99'
    const mockHeaders = new Headers({ [customHeader]: customValue })

    vi.spyOn(requestModule, 'requestWithMetadata').mockResolvedValue({
      data: {},
      status: 200,
      headers: mockHeaders,
    })

    const result = await orvalRequest<{ data: unknown; status: number; headers: Headers }>(
      '/api/data',
      { method: 'GET' },
    )

    expect(result.headers.get(customHeader)).toBe(customValue)
  })
})
