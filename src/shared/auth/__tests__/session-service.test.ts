import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sessionStore } from '../session-store'
import { appStore } from '../app-store'
import { clearAllSessionData, handleUnauthorizedEvent } from '../session-service'

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

  it('handleUnauthorizedEvent synchronously marks session as anonymous', () => {
    handleUnauthorizedEvent()

    const sessionState = sessionStore.getState()
    expect(sessionState.status).toBe('anonymous')
    expect(sessionState.accessToken).toBeNull()
  })
})
