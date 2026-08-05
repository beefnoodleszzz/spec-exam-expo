import { describe, it, expect, vi, afterEach } from 'vitest'
import { request } from '../request'
import { isAppError } from '../../errors/app-error'

describe('request transport — cancellation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('throws typed cancelled AppError (retryable: false) when external AbortSignal triggers', async () => {
    const controller = new AbortController()

    global.fetch = vi.fn().mockImplementation((_url, init) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const err = new Error('The user aborted a request')
          err.name = 'AbortError'
          reject(err)
        })
      })
    })

    const requestPromise = request({
      url: '/test/cancel',
      method: 'GET',
      signal: controller.signal,
    })

    // External cancellation
    controller.abort()

    await expect(requestPromise).rejects.toSatisfy((err: unknown) => {
      if (isAppError(err)) {
        return err.type === 'cancelled' && err.retryable === false
      }
      return false
    })
  })
})
