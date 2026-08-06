import type { PracticeSessionState } from './practice-session.store';
import { usePracticeSessionStore  } from './practice-session.store'

describe('PracticeSessionStore', () => {
  beforeEach(() => {
    usePracticeSessionStore.getState().actions.clearSession()
  })

  it('should start session and move to index', () => {
    const session: PracticeSessionState = {
      examTypeId: 'exam1',
      subjectId: 'sub1',
      mode: 'order',
      questionIds: ['q1', 'q2'],
      currentIndex: 0,
      answers: {},
      currentQuestionStartedAt: Date.now()
    }
    usePracticeSessionStore.getState().actions.startSession(session)
    expect(usePracticeSessionStore.getState().currentSession?.examTypeId).toBe('exam1')

    usePracticeSessionStore.getState().actions.moveToIndex(1)
    expect(usePracticeSessionStore.getState().currentSession?.currentIndex).toBe(1)
  })

  it('should update answer status', () => {
    const session: PracticeSessionState = {
      examTypeId: 'exam1',
      subjectId: 'sub1',
      mode: 'order',
      questionIds: ['q1'],
      currentIndex: 0,
      answers: {},
      currentQuestionStartedAt: Date.now()
    }
    usePracticeSessionStore.getState().actions.startSession(session)
    usePracticeSessionStore.getState().actions.submitAnswer('q1', ['A'], 'pending')
    expect(usePracticeSessionStore.getState().currentSession?.answers['q1']?.status).toBe('pending')

    usePracticeSessionStore.getState().actions.updateAnswerStatus('q1', 'synced')
    expect(usePracticeSessionStore.getState().currentSession?.answers['q1']?.status).toBe('synced')
  })

  it('should remove invalid question and update index', () => {
    const session: PracticeSessionState = {
      examTypeId: 'exam1',
      subjectId: 'sub1',
      mode: 'order',
      questionIds: ['q1', 'q2'],
      currentIndex: 1,
      answers: {},
      currentQuestionStartedAt: Date.now()
    }
    usePracticeSessionStore.getState().actions.startSession(session)
    usePracticeSessionStore.getState().actions.removeInvalidQuestion('q2')
    
    const current = usePracticeSessionStore.getState().currentSession
    expect(current?.questionIds).toEqual(['q1'])
    expect(current?.currentIndex).toBe(0) // adjusted to max valid index
  })
})
