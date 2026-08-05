import { describe, it, expect, vi, afterEach } from 'vitest'
import { request, setUnauthorizedHandler } from '../request'
import { isUnauthorizedError } from '../../errors/app-error'

describe('request transport — 401 unauthorized handling', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('triggers registered unauthorized handler on HTTP 401 status', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)

    global.fetch = vi.fn().mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => ({ message: 'Unauthorized' }),
    } as unknown as Response)

    await expect(
      request({ url: '/test/401', method: 'GET' }),
    ).rejects.toSatisfy(isUnauthorizedError)

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('triggers registered unauthorized handler on HTTP 200 envelope code 401', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)

    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({
        status: false,
        code: 401,
        message: 'Token expired',
      }),
    } as unknown as Response)

    await expect(
      request({ url: '/test/envelope-401', method: 'POST' }),
    ).rejects.toSatisfy(isUnauthorizedError)

    expect(handler).toHaveBeenCalledTimes(1)
  })
})
