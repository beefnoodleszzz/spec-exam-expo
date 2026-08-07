import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useSimulationSessionStore } from '../features/simulation/state/simulation-session.store'
import { resetGlobalState } from '../testing/reset-global-state'

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  }
}))

describe('Simulation Flow Integration', () => {
  beforeEach(() => {
    resetGlobalState()
    vi.clearAllMocks()
    vi.useFakeTimers()
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should test state machine (active -> submit_failed -> submitted)', () => {
    const store = useSimulationSessionStore.getState()
    const examTypeId = 'test-exam'

    store.setSession(examTypeId, {
      examTypeId,
      paperId: 'p1',
      startedAt: '2022',
      expiresAt: '2022',
      questionIds: ['q1'],
      currentIndex: 0,
      answers: {},
      status: 'active'
    })

    expect(useSimulationSessionStore.getState().sessions[examTypeId]?.status).toBe('active')

    store.updateStatus(examTypeId, 'submit_failed')
    expect(useSimulationSessionStore.getState().sessions[examTypeId]?.status).toBe('submit_failed')

    store.updateStatus(examTypeId, 'submitted')
    expect(useSimulationSessionStore.getState().sessions[examTypeId]?.status).toBe('submitted')
  })
})
