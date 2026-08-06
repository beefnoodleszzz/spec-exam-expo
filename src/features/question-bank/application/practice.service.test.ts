import { describe, it, expect, beforeEach, vi } from 'vitest'
import { practiceService } from './practice.service'
import { questionBankRemote } from '../data/question-bank.remote.impl'
import { usePracticeSessionStore } from '../state/practice-session.store'
import { appStore } from '@/shared/auth/app-store'
import type { Question } from '../domain/question.types'

vi.mock('../data/question-bank.remote.impl', () => ({
  questionBankRemote: {
    createOrderPractice: vi.fn(),
    createRandomPractice: vi.fn(),
    listWrongQuestions: vi.fn(),
    listFavoriteQuestions: vi.fn(),
    getQuestion: vi.fn(),
    submitExerciseRecord: vi.fn(),
    toggleCollection: vi.fn()
  }
}))

vi.mock('@/shared/auth/app-store', () => ({
  appStore: {
    getState: vi.fn()
  }
}))

describe('PracticeService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    usePracticeSessionStore.getState().actions.clearSession()
  })

  it('should start practice and call correct remote method based on mode', async () => {
    vi.mocked(questionBankRemote.createOrderPractice).mockResolvedValue({ questionIds: ['q1'] })
    vi.mocked(questionBankRemote.getQuestion).mockResolvedValue({ id: 'q1', type: 'single', options: [] } as any)
    
    await practiceService.startPractice({ examTypeId: 'e1', subjectId: 's1', chapterId: 'c1', mode: 'order' })
    expect(questionBankRemote.createOrderPractice).toHaveBeenCalledWith('e1', 's1', 'c1')
    expect(usePracticeSessionStore.getState().currentSession?.examTypeId).toBe('e1')
  })

  it('should handle submit answer single-flight and update status', async () => {
    vi.mocked(questionBankRemote.createOrderPractice).mockResolvedValue({ questionIds: ['q1'] })
    vi.mocked(questionBankRemote.getQuestion).mockResolvedValue({ id: 'q1', type: 'single', options: [], correctAnswers: ['A'] } as any)
    vi.mocked(questionBankRemote.submitExerciseRecord).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ correct: true, correctAnswers: ['A'], explanationHtml: '' }), 10)))
    
    await practiceService.startPractice({ examTypeId: 'e1', subjectId: 's1', mode: 'order' })
    
    // Concurrent submissions for same question
    const p1 = practiceService.submitAnswer('q1', ['A'])
    const p2 = practiceService.submitAnswer('q1', ['A'])
    
    expect(usePracticeSessionStore.getState().currentSession?.answers['q1']?.status).toBe('pending')
    
    await Promise.all([p1, p2])
    
    expect(questionBankRemote.submitExerciseRecord).toHaveBeenCalledTimes(1)
    expect(usePracticeSessionStore.getState().currentSession?.answers['q1']?.status).toBe('synced')
  })

  it('should rollback favorite on failure', async () => {
    usePracticeSessionStore.getState().actions.cacheQuestion({ id: 'q1', isFavorite: false } as unknown as Question)
    vi.mocked(questionBankRemote.toggleCollection).mockRejectedValue(new Error('fail'))
    
    await expect(practiceService.toggleFavorite('q1')).rejects.toThrow('fail')
    expect(usePracticeSessionStore.getState().questionsCache['q1']?.isFavorite).toBe(false)
  })

  it('should clear session on resume if examTypeId mismatch', async () => {
    usePracticeSessionStore.getState().actions.startSession({
      examTypeId: 'e1', subjectId: 's1', mode: 'order', questionIds: ['q1'], currentIndex: 0, answers: {}, currentQuestionStartedAt: Date.now()
    })
    vi.mocked(appStore.getState).mockReturnValue({ currentExamProfile: { examTypeId: 'different' } } as any)
    
    await practiceService.resumeSession()
    expect(usePracticeSessionStore.getState().currentSession).toBeNull()
  })
})
