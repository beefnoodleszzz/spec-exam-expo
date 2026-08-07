import { describe, it, expect, beforeEach, vi } from 'vitest'
import { sessionStore } from '../shared/auth/session-store'

import { queryClient } from '../shared/query/query-client'
import { usePracticeSessionStore } from '../features/question-bank/state/practice-session.store'
import { useSimulationSessionStore } from '../features/simulation/state/simulation-session.store'
import { resetGlobalState } from '../testing/reset-global-state'
import { clearAllSessionData } from '../shared/auth/session-service'

vi.mock('../shared/persistence/secure-storage', () => ({
  clearSecureCredentials: vi.fn().mockResolvedValue(undefined),
  getSecure: vi.fn(),
  setSecure: vi.fn(),
  SecureKeys: { ACCESS_TOKEN: 'ACCESS_TOKEN', USER_ID: 'USER_ID' }
}))

describe('Logout Cleanup Integration', () => {
  beforeEach(() => {
    resetGlobalState()
    vi.clearAllMocks()
  })

  it('should wipe query cache, session, practice/simulation stores on logout', async () => {
    sessionStore.setState({ accessToken: 'valid', status: 'authenticated', userId: '1' })
    queryClient.setQueryData(['test'], { data: 123 })
    usePracticeSessionStore.setState({ 
      currentSession: { examTypeId: '1', subjectId: '1', mode: 'order', questionIds: [], currentIndex: 0, answers: {}, draftAnswers: {}, currentQuestionStartedAt: 0 } 
    })
    useSimulationSessionStore.setState({ 
      sessions: { 'sim-1': { examTypeId: '1', paperId: '1', startedAt: '2022', expiresAt: '2022', questionIds: [], currentIndex: 0, answers: {}, status: 'active' } } 
    })

    await clearAllSessionData()

    // Wait for dynamic imports to resolve
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(sessionStore.getState().status).toBe('anonymous')
    expect(queryClient.getQueryData(['test'])).toBeUndefined()
    expect(usePracticeSessionStore.getState().currentSession).toBeNull()
    expect(useSimulationSessionStore.getState().sessions).toEqual({})
  })
})
