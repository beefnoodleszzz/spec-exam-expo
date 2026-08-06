import { describe, it, expect, beforeEach } from 'vitest'
import { sessionStore } from '../session-store'
import { appStore } from '../app-store'
import { clearAllSessionData } from '../session-service'

describe('sessionService (Session Cleanup Coordinator)', () => {
  beforeEach(() => {
    sessionStore.setState({
      status: 'authenticated',
      accessToken: 'test-token',
      userId: 'test-user-123',
    })
    appStore.setState({
      currentExamProfile: {
        examTypeId: '101',
        examTypeName: '电工操作证',
      },
    })
  })

  it('clearAllSessionData resets sessionStore status to anonymous and clears credentials', async () => {
    await clearAllSessionData()

    const sessionState = sessionStore.getState()
    const appState = appStore.getState()

    expect(sessionState.status).toBe('anonymous')
    expect(sessionState.accessToken).toBeNull()
    expect(sessionState.userId).toBeNull()
    expect(appState.currentExamProfile).toBeNull()
  })

  it('deduplicates concurrent clearAllSessionData calls using single-flight promise lock', () => {
    const promise1 = clearAllSessionData()
    const promise2 = clearAllSessionData()

    expect(promise1).toBe(promise2)
  })
})
