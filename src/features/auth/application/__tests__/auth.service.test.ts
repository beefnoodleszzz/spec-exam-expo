import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from '../auth.service'
import type { AuthRemote } from '../../data/auth.remote'
import type { AuthSession, AuthUser } from '../../domain/auth.types'

describe('AuthService', () => {
  let authService: AuthService
  let mockRemote: AuthRemote
  let persistedSession: AuthSession | null
  let setUser: AuthUser | null

  beforeEach(() => {
    persistedSession = null
    setUser = null

    mockRemote = {
      sendShortMessage: vi.fn().mockResolvedValue({
        requestId: 'req-123',
      }),
      loginWithShortMessage: vi.fn().mockResolvedValue({
        accessToken: 'token-123',
        userId: 'user-456',
      }),
      loginWithCode: vi.fn(),
      loginWithOneClick: vi.fn(),
      getCurrentUser: vi.fn().mockResolvedValue({
        id: 'user-456',
        phone: '13812340000',
        nickname: 'Test User',
        avatarUrl: null,
      }),
    }

    authService = new AuthService({
      remote: mockRemote,
      persistSession: async (session) => {
        persistedSession = session
      },
      clearSession: async () => {
        persistedSession = null
      },
      setUser: (user) => {
        setUser = user
      },
      clearUser: () => {
        setUser = null
      },
    })
  })

  describe('sendShortMessage', () => {
    it('calls remote and returns requestId', async () => {
      const result = await authService.sendShortMessage({
        phone: '13812340000',
      })

      expect(result.requestId).toBe('req-123')
      expect(mockRemote.sendShortMessage).toHaveBeenCalled()
    })
  })

  describe('loginWithShortMessage', () => {
    it('persists session after successful login', async () => {
      await authService.loginWithShortMessage({
        phone: '13812340000',
        verificationCode: '123456',
        requestId: 'req-123',
      })

      expect(persistedSession).toEqual({
        accessToken: 'token-123',
        userId: 'user-456',
      })
    })

    it('fetches and sets user after login', async () => {
      await authService.loginWithShortMessage({
        phone: '13812340000',
        verificationCode: '123456',
        requestId: 'req-123',
      })

      expect(setUser?.id).toBe('user-456')
      expect(setUser?.phone).toBe('13812340000')
    })

    it('prevents duplicate login requests', async () => {
      const cmd = {
        phone: '13812340000',
        verificationCode: '123456',
        requestId: 'req-123',
      }

      const promise1 = authService.loginWithShortMessage(cmd)
      const promise2 = authService.loginWithShortMessage(cmd)

      await Promise.all([promise1, promise2])

      expect(mockRemote.loginWithShortMessage).toHaveBeenCalledTimes(1)
    })
  })

  describe('logout', () => {
    it('clears session and user', async () => {
      persistedSession = { accessToken: 'token', userId: 'user' }
      setUser = { id: 'user', phone: null, nickname: null, avatarUrl: null }

      await authService.logout()

      expect(persistedSession).toBeNull()
      expect(setUser).toBeNull()
    })
  })
})
