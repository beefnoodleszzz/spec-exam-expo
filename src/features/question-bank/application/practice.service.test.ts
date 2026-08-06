import { describe, it, expect, beforeEach, vi } from 'vitest'
import { practiceService } from './practice.service'
import { questionBankRemote } from '../data/question-bank.remote.impl'
import { usePracticeSessionStore } from '../state/practice-session.store'
import { appStore } from '@/shared/auth/app-store'


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
    vi.mocked(questionBankRemote.getQuestion).mockResolvedValue({ id: 'q1', type: 'single', options: [] } as never)
    
    await practiceService.startPractice({ examTypeId: 'e1', subjectId: 's1', chapterId: 'c1', mode: 'order' })
    expect(questionBankRemote.createOrderPractice).toHaveBeenCalledWith('e1', 's1', 'c1')
    expect(usePracticeSessionStore.getState().currentSession?.examTypeId).toBe('e1')
  })

  it('should handle submit answer single-flight and update status', async () => {
    vi.mocked(questionBankRemote.createOrderPractice).mockResolvedValue({ questionIds: ['q1'] })
    vi.mocked(questionBankRemote.getQuestion).mockResolvedValue({ id: 'q1', type: 'single', options: [], correctAnswers: ['A'] } as never)
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
    usePracticeSessionStore.getState().actions.cacheQuestion({ id: 'q1', isFavorite: false } as never)
    vi.mocked(questionBankRemote.toggleCollection).mockRejectedValue(new Error('fail'))
    
    await expect(practiceService.toggleFavorite('q1')).rejects.toThrow('fail')
    expect(usePracticeSessionStore.getState().questionsCache['q1']?.isFavorite).toBe(false)
  })

  it('should clear session on resume if examTypeId mismatch', async () => {
    usePracticeSessionStore.getState().actions.startSession({
      examTypeId: 'e1', subjectId: 's1', mode: 'order', questionIds: ['q1'], currentIndex: 0, answers: {}, currentQuestionStartedAt: Date.now()
    })
    vi.mocked(appStore.getState).mockReturnValue({ currentExamProfile: { examTypeId: 'different' } } as never)
    
    await practiceService.resumeSession()
    expect(usePracticeSessionStore.getState().currentSession).toBeNull()
  })

  it('should handle submit fallback values from Service layer', async () => {
    vi.mocked(questionBankRemote.createOrderPractice).mockResolvedValue({ questionIds: ['q1'] })
    vi.mocked(questionBankRemote.getQuestion).mockResolvedValue({ 
      id: 'q1', type: 'single', options: [], correctAnswers: ['B'], explanationHtml: '<p>default</p>' 
    } as never)
    
    // Simulate backend only returning correct (subjectErrorCount fallback logic in remote) and empty arrays
    vi.mocked(questionBankRemote.submitExerciseRecord).mockResolvedValue({ 
      correct: false, correctAnswers: [], explanationHtml: null 
    })
    
    await practiceService.startPractice({ examTypeId: 'e1', subjectId: 's1', mode: 'order' })
    await practiceService.submitAnswer('q1', ['A'])
    
    const session = usePracticeSessionStore.getState().currentSession
    expect(session?.answers['q1']?.serverCorrect).toBe(false)
    expect(session?.answers['q1']?.correctAnswers).toEqual(['B'])
    expect(session?.answers['q1']?.explanationHtml).toBe('<p>default</p>')
    expect(session?.answers['q1']?.status).toBe('synced')
  })

  it('should transition from failed to synced on retry', async () => {
    vi.mocked(questionBankRemote.createOrderPractice).mockResolvedValue({ questionIds: ['q1'] })
    vi.mocked(questionBankRemote.getQuestion).mockResolvedValue({ 
      id: 'q1', type: 'single', options: [], correctAnswers: ['B'], userAnswers: ['A']
    } as never)
    
    await practiceService.startPractice({ examTypeId: 'e1', subjectId: 's1', mode: 'order' })
    
    // 1. Initial submit fails
    vi.mocked(questionBankRemote.submitExerciseRecord).mockRejectedValueOnce(new Error('Network error'))
    await practiceService.submitAnswer('q1', ['A'])
    
    let session = usePracticeSessionStore.getState().currentSession
    expect(session?.answers['q1']?.status).toBe('failed')
    
    // 2. Retry succeeds
    vi.mocked(questionBankRemote.submitExerciseRecord).mockResolvedValueOnce({ 
      correct: false, correctAnswers: ['B'], explanationHtml: '<p>retry</p>' 
    })
    
    await practiceService.retryAnswer('q1')
    
    session = usePracticeSessionStore.getState().currentSession
    expect(session?.answers['q1']?.status).toBe('synced')
    expect(session?.answers['q1']?.serverCorrect).toBe(false)
    expect(session?.answers['q1']?.explanationHtml).toBe('<p>retry</p>')
  })
})
