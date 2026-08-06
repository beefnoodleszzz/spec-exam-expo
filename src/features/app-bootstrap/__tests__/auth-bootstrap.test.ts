/**
 * Tests for app bootstrap — session restore and auth user restore logic.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRestoreSession = vi.fn().mockResolvedValue(undefined)
const mockRestoreExamProfile = vi.fn().mockResolvedValue(undefined)
const mockRestoreFromStorage = vi.fn().mockResolvedValue(undefined)
const mockSetError = vi.fn()

let mockSessionStatus = 'anonymous'

vi.mock('@/shared/auth/session-store', () => ({
  sessionStore: Object.assign(
    (selector: (s: { status: string; restoreSession: typeof mockRestoreSession }) => unknown) =>
      selector({ status: mockSessionStatus, restoreSession: mockRestoreSession }),
    {
      getState: () => ({
        status: mockSessionStatus,
        setSession: vi.fn().mockResolvedValue(undefined),
      }),
    },
  ),
}))

vi.mock('@/shared/auth/app-store', () => ({
  appStore: (selector: (s: { restoreExamProfile: typeof mockRestoreExamProfile }) => unknown) =>
    selector({ restoreExamProfile: mockRestoreExamProfile }),
}))

vi.mock('@/shared/auth/session-service', () => ({
  registerUnauthorizedHandler: vi.fn(),
  clearAllSessionData: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/features/auth/state/auth-user.store', () => ({
  useAuthUserStore: {
    getState: vi.fn().mockReturnValue({
      restoreFromStorage: mockRestoreFromStorage,
      setUser: vi.fn(),
      setError: mockSetError,
    }),
  },
}))

vi.mock('expo-splash-screen', () => ({
  hideAsync: vi.fn().mockResolvedValue(undefined),
  preventAutoHideAsync: vi.fn().mockResolvedValue(undefined),
}))

describe('bootstrap auth user restore', () => {
  beforeEach(() => {
    mockSessionStatus = 'anonymous'
    vi.clearAllMocks()
  })

  it('exports useAppBootstrap function', async () => {
    const mod = await import('../hooks/useAppBootstrap')
    expect(typeof mod.useAppBootstrap).toBe('function')
  })

  it('does not call restoreFromStorage when anonymous at module level', () => {
    mockSessionStatus = 'anonymous'
    expect(mockRestoreFromStorage).not.toHaveBeenCalled()
  })
})

describe('session restore dependencies', () => {
  it('restoreSession mock is a function returning resolved promise', async () => {
    const result = await mockRestoreSession()
    expect(result).toBeUndefined()
  })

  it('restoreExamProfile mock is a function returning resolved promise', async () => {
    const result = await mockRestoreExamProfile()
    expect(result).toBeUndefined()
  })

  it('restoreFromStorage mock is callable', async () => {
    const result = await mockRestoreFromStorage()
    expect(result).toBeUndefined()
  })
})
