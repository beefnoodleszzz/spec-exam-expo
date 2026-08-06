import type { QuestionBankRemote, PracticeSessionSeed, SubmitAnswerInput, AnswerResult as DomainAnswerResult } from './question-bank.remote'
import type { Subject } from '../domain/subject.types'
import type { Chapter } from '../domain/chapter.types'
import type { Question, QuestionOption, QuestionType } from '../domain/question.types'
import { extractGeneratedData } from '@/shared/api/generated-response'
import { z } from 'zod'
import { subjectSchema } from './subject.schema'
import { chapterSchema } from './chapter.schema'
import { questionSchema } from './question.schema'
import { answerResultSchema } from './answer.schema'
import { 
  mapCreateOrderPracticeRequest,
  mapCreateRandomPracticeRequest,
  mapListWrongQuestionsRequest,
  mapListFavoriteQuestionsRequest,
  mapSubmitAnswerRequest,
  mapToggleCollectionRequest
} from './question-bank.request-mapper'

import { 
  apiExamV2AppSubjectGetExamTypeGet,
  apiExamV2AppSubjectGetSubjectGroupGet,
  apiExamV2AppSubjectGetSubjectsByGroupPost,
  apiExamV2AppSubjectGetSubjectsPost,
  apiExamV2AppSubjectSubmitExerciseRecordPut,
  apiExamV2AppSubjectGetSubjectsByIdsPost
} from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2'

export class QuestionBankRemoteImpl implements QuestionBankRemote {
  async listSubjects(_examTypeId: string, signal?: AbortSignal): Promise<Subject[]> {
    const options = signal ? { signal } : {}
    const res = await apiExamV2AppSubjectGetExamTypeGet({}, options)
    const data = extractGeneratedData(res.data, '获取科目列表')
    
    const parsed = z.array(z.any()).parse(data)
    
    return parsed.map((item) => {
      const subject = subjectSchema.parse(item)
      return {
        id: subject.id,
        name: subject.name,
        questionCount: subject.questionCount ?? null,
        progress: subject.progress ? {
          answered: subject.progress.answered,
          correct: subject.progress.correct,
          total: subject.progress.total,
        } : null
      }
    })
  }

  async listChapters(subjectId: string, signal?: AbortSignal): Promise<Chapter[]> {
    const options = signal ? { signal } : {}
    const res = await apiExamV2AppSubjectGetSubjectGroupGet({ 
      type: Number(subjectId), 
      index: 1, 
      size: 1000 
    }, options)
    const data = extractGeneratedData(res.data, '获取章节列表')
    
    const parsed = z.array(z.any()).parse(data)
    
    const mapChapter = (item: unknown): Chapter => {
      const chapter = chapterSchema.parse(item)
      const typedItem = item as { examSubtypes?: unknown }
      return {
        id: chapter.id,
        subjectId,
        name: chapter.name,
        questionCount: chapter.questionCount,
        answeredCount: chapter.answeredCount,
        children: typedItem.examSubtypes ? z.array(z.any()).parse(typedItem.examSubtypes).map(mapChapter) : []
      }
    }
    
    return parsed.map(mapChapter)
  }

  private mapQuestionsResult(res: { data?: unknown }, context: string): PracticeSessionSeed {
    const data = extractGeneratedData(res.data, context) as Record<string, unknown> | unknown[]
    const list = Array.isArray(data) ? data : (data as { dataList?: unknown[] }).dataList || data || []
    const parsed = z.array(questionSchema).parse(list)
    return { questionIds: parsed.map(q => q.id) }
  }

  async createOrderPractice(examTypeId: string, subjectId: string, chapterId?: string, signal?: AbortSignal): Promise<PracticeSessionSeed> {
    const options = signal ? { signal } : {}
    const req = mapCreateOrderPracticeRequest(examTypeId, chapterId)
    const res = await apiExamV2AppSubjectGetSubjectsByGroupPost(req, options)
    return this.mapQuestionsResult(res, '创建顺序练习')
  }

  async createRandomPractice(examTypeId: string, _subjectId: string, signal?: AbortSignal): Promise<PracticeSessionSeed> {
    const options = signal ? { signal } : {}
    const req = mapCreateRandomPracticeRequest(examTypeId)
    const res = await apiExamV2AppSubjectGetSubjectsPost(req, options)
    return this.mapQuestionsResult(res, '创建随机练习')
  }

  async listWrongQuestions(examTypeId: string, _subjectId: string, signal?: AbortSignal): Promise<PracticeSessionSeed> {
    const options = signal ? { signal } : {}
    const req = mapListWrongQuestionsRequest(examTypeId)
    const res = await apiExamV2AppSubjectGetSubjectsPost(req, options)
    return this.mapQuestionsResult(res, '获取错题列表')
  }

  async listFavoriteQuestions(examTypeId: string, _subjectId: string, signal?: AbortSignal): Promise<PracticeSessionSeed> {
    const options = signal ? { signal } : {}
    const req = mapListFavoriteQuestionsRequest(examTypeId)
    const res = await apiExamV2AppSubjectGetSubjectsPost(req, options)
    return this.mapQuestionsResult(res, '获取收藏列表')
  }

  async getQuestionsByIds(ids: string[], signal?: AbortSignal): Promise<Question[]> {
    const options = signal ? { signal } : {}
    const res = await apiExamV2AppSubjectGetSubjectsByIdsPost({ ids }, options)
    
    const data = extractGeneratedData(res.data, '获取题目') as Record<string, unknown> | unknown[]
    const list = Array.isArray(data) ? data : (data as { dataList?: unknown[] }).dataList || data || []
    if (!Array.isArray(list)) return []
    
    return list.map((item) => {
      const parsed = questionSchema.parse(item)
      let type: QuestionType = 'unknown'
      let optionsArr: QuestionOption[] = []
      
      const itemObj = item as Record<string, unknown>
      const legacyType = itemObj.questionType || itemObj.type || itemObj.subjectType
      if (legacyType === 1) type = 'judge'
      else if (legacyType === 2) type = 'single'
      else if (legacyType === 3) type = 'multiple'
      
      try {
        if (typeof parsed.selection === 'string' && parsed.selection.startsWith('[')) {
          const arr = JSON.parse(parsed.selection)
          optionsArr = arr.map((opt: string, i: number) => ({ id: String.fromCharCode(65 + i), label: String.fromCharCode(65 + i), content: opt }))
        } else if (Array.isArray(parsed.selection)) {
          optionsArr = parsed.selection.map((opt: string, i: number) => ({ id: String.fromCharCode(65 + i), label: String.fromCharCode(65 + i), content: opt }))
        } else if (typeof parsed.selection === 'string' && parsed.selection.includes('正确') && parsed.selection.includes('错误')) {
          optionsArr = [
            { id: 'A', label: 'A', content: '正确' },
            { id: 'B', label: 'B', content: '错误' }
          ]
          type = 'judge'
        }
      } catch {
        // Ignored
      }
      
      if (type === 'unknown') {
        type = parsed.answer.length > 1 ? 'multiple' : 'single'
      }

      const correctAnswersStr = Array.isArray(parsed.answer) ? parsed.answer.join('') : String(parsed.answer)
      const correctAnswers = correctAnswersStr.replace(/,/g, '').split('').filter(Boolean)
      
      return {
        id: parsed.id,
        type,
        stemHtml: parsed.title,
        options: optionsArr,
        correctAnswers,
        explanationHtml: parsed.desc || null,
        isFavorite: parsed.isCollection,
        userAnswers: []
      }
    })
  }

  async getQuestion(questionId: string, signal?: AbortSignal): Promise<Question> {
    const list = await this.getQuestionsByIds([questionId], signal)
    if (list.length === 0) throw new Error('未找到该题目')
    return list[0]!
  }

  async submitExerciseRecord(input: SubmitAnswerInput, signal?: AbortSignal): Promise<DomainAnswerResult> {
    const options = signal ? { signal } : {}
    const req = mapSubmitAnswerRequest(input.questionId, input.answers, input.elapsedSeconds, input.isMistake ?? false, input.isFavorite ?? false)
    const res = await apiExamV2AppSubjectSubmitExerciseRecordPut(req, options)
    
    const data = extractGeneratedData(res.data, '提交答案')
    const parsed = answerResultSchema.parse(data)
    
    return {
      correct: parsed.subjectErrorCount === 0,
      correctAnswers: [],
      explanationHtml: null
    }
  }

  async toggleCollection(questionId: string, favorite: boolean, signal?: AbortSignal): Promise<void> {
    const options = signal ? { signal } : {}
    const req = mapToggleCollectionRequest(questionId, favorite)
    await apiExamV2AppSubjectSubmitExerciseRecordPut(req, options)
  }
}

export const questionBankRemote = new QuestionBankRemoteImpl()
