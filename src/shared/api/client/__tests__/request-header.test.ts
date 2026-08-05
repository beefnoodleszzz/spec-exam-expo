import { describe, it, expect, vi, afterEach } from 'vitest'
import { request } from '../request'
import { isAppError } from '../../errors/app-error'

describe('request transport — headers and protection', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('throws contract error if caller attempts to override protected signature headers', async () => {
    await expect(
      request({
        url: '/test/protected-header',
        method: 'GET',
        headers: {
          examtoken: 'malicious-override-attempt',
        },
      }),
    ).rejects.toSatisfy((err: unknown) => {
      if (isAppError(err)) {
        return err.type === 'contract' && err.message.includes('Cannot override protected header')
      }
      return false
    })
  })

  it('handles custom header casing properly (case-insensitive checks)', async () => {
    await expect(
      request({
        url: '/test/header-case',
        method: 'GET',
        headers: {
          'eXaMToKen': 'override-attempt',
        },
      }),
    ).rejects.toSatisfy((err: unknown) => {
      if (isAppError(err)) {
        return err.type === 'contract' && err.message.includes('Cannot override protected header')
      }
      return false
    })
  })
})
