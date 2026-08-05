import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { request } from '../request'
import { isAppError } from '../../errors/app-error'

describe('request transport — timeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('throws typed timeout AppError when request exceeds timeoutMs', async () => {
    // Mock fetch that hangs until aborted
    global.fetch = vi.fn().mockImplementation((_url, init) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const err = new Error('The operation was aborted')
          err.name = 'AbortError'
          reject(err)
        })
      })
    })

    const requestPromise = request({
      url: '/test/timeout',
      method: 'GET',
      timeoutMs: 5000,
    })

    // Advance time past 5000ms
    vi.advanceTimersByTime(5001)

    await expect(requestPromise).rejects.toSatisfy((err: unknown) => {
      if (isAppError(err)) {
        return err.type === 'timeout' && err.retryable === true
      }
      return false
    })
  })
})
