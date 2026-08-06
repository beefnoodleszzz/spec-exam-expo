/**
 * Tests for auth.container.ts.
 */

import { describe, it, expect, vi } from 'vitest'
import {
  getAuthService,
  clearAuthenticatedState,
  authRemote,
  authService,
} from '../auth.container'
import { clearAllSessionData } from '@/shared/auth/session-service'

vi.mock('@/shared/auth/session-store', () => ({
  sessionStore: {
    getState: vi.fn().mockReturnValue({
      setSession: vi.fn().mockResolvedValue(undefined),
      restoreSession: vi.fn().mockResolvedValue(undefined),
      status: 'anonymous',
      accessToken: null,
      userId: null,
    }),
  },
}))

vi.mock('@/shared/auth/session-service', () => ({
  clearAllSessionData: vi.fn().mockResolvedValue(undefined),
  registerUnauthorizedHandler: vi.fn(),
  handleUnauthorizedEvent: vi.fn(),
}))

vi.mock('@/features/auth/state/auth-user.store', () => ({
  useAuthUserStore: {
    getState: vi.fn().mockReturnValue({
      setUser: vi.fn(),
      clearUser: vi.fn(),
    }),
  },
}))

vi.mock('@/features/auth/data/auth.remote.impl', () => ({
  AuthRemoteImpl: vi.fn().mockImplementation(() => ({
    sendShortMessage: vi.fn(),
    loginWithShortMessage: vi.fn(),
    loginWithCode: vi.fn(),
    loginWithOneClick: vi.fn(),
    getCurrentUser: vi.fn(),
  })),
}))

describe('auth.container', () => {
  it('exports authRemote as AuthRemoteImpl instance', () => {
    expect(authRemote).toBeDefined()
    expect(typeof authRemote.sendShortMessage).toBe('function')
  })

  it('exports authService as AuthService instance', () => {
    expect(authService).toBeDefined()
    expect(typeof authService.loginWithShortMessage).toBe('function')
  })

  it('getAuthService returns the same singleton', () => {
    expect(getAuthService()).toBe(authService)
  })

  it('clearAuthenticatedState calls clearAllSessionData', async () => {
    await clearAuthenticatedState()
    expect(clearAllSessionData).toHaveBeenCalled()
  })
})
