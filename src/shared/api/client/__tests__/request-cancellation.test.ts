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

  it('removes AbortSignal listener on completion', async () => {
    const controller = new AbortController()
    const removeEventListenerSpy = vi.spyOn(controller.signal, 'removeEventListener')
    
    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve(new Response(JSON.stringify({ status: true, data: {} })))
    })

    await request({
      url: '/test/cleanup',
      method: 'GET',
      signal: controller.signal,
    })

    expect(removeEventListenerSpy).toHaveBeenCalledWith('abort', expect.any(Function))
  })

  it('throws typed cancelled AppError immediately if external signal is already aborted', async () => {
    const controller = new AbortController()
    controller.abort() // Abort before passing to request

    global.fetch = vi.fn().mockImplementation((_url, init) => {
      if (init?.signal?.aborted) {
        const err = new Error('aborted')
        err.name = 'AbortError'
        return Promise.reject(err)
      }
      return Promise.resolve(new Response('{}'))
    })

    await expect(
      request({
        url: '/test/pre-aborted',
        method: 'GET',
        signal: controller.signal,
      })
    ).rejects.toSatisfy((err: unknown) => {
      if (isAppError(err)) {
        return err.type === 'cancelled' && err.retryable === false
      }
      return false
    })
    
    // fetch is called, but it immediately rejects due to aborted signal
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })
})
