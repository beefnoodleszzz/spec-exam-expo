import { describe, it, expect, beforeEach } from 'vitest'
import { useSimulationSessionStore } from '../simulation-session.store'

describe('SimulationSessionStore', () => {
  beforeEach(() => {
    useSimulationSessionStore.setState({ sessions: {}, lastResult: null })
  })

  it('sets and updates session status', () => {
    const store = useSimulationSessionStore.getState()
    store.setSession('exam1', { status: 'active', currentIndex: 0, answers: {} } as never)
    
    useSimulationSessionStore.getState().updateStatus('exam1', 'submitted')
    expect(useSimulationSessionStore.getState().sessions['exam1']?.status).toBe('submitted')
  })
})
