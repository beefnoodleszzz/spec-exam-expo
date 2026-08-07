import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePracticeSessionStore } from '../features/question-bank/state/practice-session.store'
import { resetGlobalState } from '../testing/reset-global-state'

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  }
}))

describe('Practice Flow Integration', () => {
  beforeEach(() => {
    resetGlobalState()
    vi.clearAllMocks()
  })

  it('should go from session creation to answer submission', () => {
    const actions = usePracticeSessionStore.getState().actions
    
    actions.startSession({
      examTypeId: '1',
      subjectId: '2',
      mode: 'order',
      questionIds: ['q1', 'q2'],
      currentIndex: 0,
      answers: {},
      draftAnswers: {},
      currentQuestionStartedAt: Date.now()
    })
    expect(usePracticeSessionStore.getState().currentSession?.questionIds).toEqual(['q1', 'q2'])

    actions.setDraftAnswer('q1', ['A'])
    expect(usePracticeSessionStore.getState().currentSession?.draftAnswers['q1']).toEqual(['A'])

    actions.submitAnswer('q1', ['A'], 'pending')
    expect(usePracticeSessionStore.getState().currentSession?.answers['q1']?.status).toBe('pending')

    actions.markAnswerSynced({
      questionId: 'q1',
      correct: true,
      correctAnswers: ['A'],
      explanationHtml: 'test'
    })
    expect(usePracticeSessionStore.getState().currentSession?.answers['q1']?.status).toBe('synced')
    expect(usePracticeSessionStore.getState().currentSession?.answers['q1']?.serverCorrect).toBe(true)

    actions.clearSession()
    expect(usePracticeSessionStore.getState().currentSession).toBeNull()
  })
})
