import { describe, it, expect, beforeEach, vi } from 'vitest'
import { questionBankRemote } from './question-bank.remote.impl'
import * as apiModule from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2'

vi.mock('@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2', () => ({
  apiExamV2AppSubjectGetExamTypeGet: vi.fn(),
  apiExamV2AppSubjectGetSubjectGroupGet: vi.fn(),
  apiExamV2AppSubjectSubmitExerciseRecordPut: vi.fn(),
  apiExamV2AppSubjectGetSubjectGroupPost: vi.fn(),
  apiExamV2AppSubjectGetSubjectsPost: vi.fn(),
  apiExamV2AppSubjectGetSubjectCollectionPost: vi.fn(),
  apiExamV2AppSubjectGetSubjectMistakePost: vi.fn(),
  apiExamV2AppSubjectGetSubjectsByIdsPost: vi.fn(),
  apiExamV2AppSubjectToggleCollectionPut: vi.fn(),
  apiExamV2AppSubjectGetSubjectsByGroupPost: vi.fn(),
}))

describe('QuestionBankRemoteImpl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listSubjects should throw if examTypeId does not match context', async () => {
    const { appStore } = await import('@/shared/auth/app-store')
    appStore.setState({ currentExamProfile: { examTypeId: 'different-id', examTypeCode: 'test-code', name: 'Test' } as never })

    await expect(questionBankRemote.listSubjects('requested-id'))
      .rejects.toThrow('当前请求的考试类型与全局上下文不一致')
  })

  it('listSubjects should use current exam context successfully', async () => {
    const { appStore } = await import('@/shared/auth/app-store')
    appStore.setState({ currentExamProfile: { examTypeId: 'requested-id', examTypeCode: 'test-code', name: 'Test' } as never })
    
    vi.mocked(apiModule.apiExamV2AppSubjectGetExamTypeGet).mockResolvedValue({
      data: { code: 200, data: [] }
    } as never)

    const res = await questionBankRemote.listSubjects('requested-id')
    expect(res).toEqual([])
  })

  it('listChapters should pass abort signal correctly', async () => {
    vi.mocked(apiModule.apiExamV2AppSubjectGetSubjectGroupGet).mockResolvedValue({
      data: { code: 200, data: [] }
    } as never)

    const controller = new AbortController()
    await questionBankRemote.listChapters('1', controller.signal)

    expect(apiModule.apiExamV2AppSubjectGetSubjectGroupGet).toHaveBeenCalledWith(
      { type: 1, index: 1, size: 1000 },
      { signal: controller.signal }
    )
  })

  it('submitExerciseRecord should format answer arrays correctly', async () => {
    vi.mocked(apiModule.apiExamV2AppSubjectSubmitExerciseRecordPut).mockResolvedValue({
      data: {
        code: 200,
        data: { subjectErrorCount: 0, subjectTotalCount: 1 }
      }
    } as never)

    const res = await questionBankRemote.submitExerciseRecord({
      questionId: 'q1',
      answers: ['A', 'B'],
      elapsedSeconds: 5,
      isMistake: false,
      isFavorite: true
    })

    expect(apiModule.apiExamV2AppSubjectSubmitExerciseRecordPut).toHaveBeenCalledWith({
      subjectList: [{
        id: 'q1',
        answer: 'A,B',
        isMistake: false,
        isCollection: true
      }],
      time: 5
    }, expect.any(Object))
    
    expect(res.correct).toBe(true)
  })

  it('createOrderPractice should extract and return seed', async () => {
    vi.mocked(apiModule.apiExamV2AppSubjectGetSubjectsByGroupPost).mockResolvedValue({
      data: {
        code: 200,
        data: {
          dataList: [
            { id: 'q1', type: 'single', stemHtml: '', options: [], correctAnswers: [], explanationHtml: '', isFavorite: false, userAnswers: [] },
            { id: 'q2', type: 'single', stemHtml: '', options: [], correctAnswers: [], explanationHtml: '', isFavorite: false, userAnswers: [] }
          ]
        }
      }
    } as never)

    const seed = await questionBankRemote.createOrderPractice('e1', 's1', 'c1')
    expect(seed.questionIds).toEqual(['q1', 'q2'])
  })
})
