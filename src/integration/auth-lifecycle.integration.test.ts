import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { sessionStore } from '../shared/auth/session-store'
import { resetGlobalState } from '../testing/reset-global-state'
import { request, setUnauthorizedHandler } from '../shared/api/client/request'
import { clearAllSessionData } from '../shared/auth/session-service'

vi.mock('../shared/persistence/secure-storage', () => ({
  clearSecureCredentials: vi.fn().mockResolvedValue(undefined),
  getSecure: vi.fn(),
  setSecure: vi.fn(),
  SecureKeys: { ACCESS_TOKEN: 'ACCESS_TOKEN', USER_ID: 'USER_ID' }
}))

describe('Auth Lifecycle Integration', () => {
  beforeEach(() => {
    resetGlobalState()
    vi.stubGlobal('fetch', vi.fn())
    setUnauthorizedHandler(() => void clearAllSessionData())
    vi.clearAllMocks()
  })

  it('should handle 401 and trigger cleanup exactly once (single flight)', async () => {
    const { clearSecureCredentials } = await import('../shared/persistence/secure-storage')
    
    sessionStore.setState({ accessToken: 'valid', status: 'authenticated' })
    
    const fetchMock = global.fetch as Mock
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
      headers: new Headers(),
    })

    const p1 = request({ url: '/api/1', method: 'GET' }).catch(() => {})
    const p2 = request({ url: '/api/2', method: 'GET' }).catch(() => {})
    const p3 = request({ url: '/api/3', method: 'GET' }).catch(() => {})
    
    await Promise.all([p1, p2, p3])

    // Wait briefly for the finally block of the promise lock to execute
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(clearSecureCredentials).toHaveBeenCalledTimes(1)
    expect(sessionStore.getState().status).toBe('anonymous')
    expect(sessionStore.getState().accessToken).toBeNull()
  })
})
