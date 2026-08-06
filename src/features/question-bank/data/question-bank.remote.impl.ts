import type { QuestionBankRemote, CreatePracticeInput, PracticeSessionSeed, SubmitAnswerInput, AnswerResult as DomainAnswerResult } from './question-bank.remote'
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
  apiExamV2AppSubjectGetExamTypeGet,
  apiExamV2AppSubjectGetSubjectsPost,
  apiExamV2AppSubjectSubmitExerciseRecordPut,
  apiExamV2AppSubjectGetSubjectsByIdsPost
} from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2'

export class QuestionBankRemoteImpl implements QuestionBankRemote {
  async listSubjects(examTypeId: string, signal?: AbortSignal): Promise<Subject[]> {
    const options = signal ? { signal } : {}
    const res = await apiExamV2AppSubjectGetExamTypeGet({}, options)
    const data = extractGeneratedData(res, '获取科目列表')
    
    // In legacy, getExamType returns a tree. The top level are subjects.
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
    // If backend requires it, pass something? Or in legacy chapters are returned inside subjects.
    const res = await apiExamV2AppSubjectGetExamTypeGet({}, options)
    const data = extractGeneratedData(res, '获取章节列表')
    
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

  async createPractice(input: CreatePracticeInput, signal?: AbortSignal): Promise<PracticeSessionSeed> {
    const options = signal ? { signal } : {}
    
    let isMistake = false
    let isCollection = false
    
    if (input.mode === 'wrong') { isMistake = true }
    if (input.mode === 'favorite') { isCollection = true }

    const reqPayload: Record<string, unknown> = {
      examTypeId: input.examTypeId,
      isMistake,
      isCollection,
      index: 1,
      size: 1000 
    }
    if (input.mode === 'wrong') reqPayload.type = '3'
    if (input.chapterId) reqPayload.subjectGroupId = input.chapterId

    // Bypass type checking gracefully
    const apiCall = apiExamV2AppSubjectGetSubjectsPost as unknown as (data: unknown, options: unknown) => Promise<unknown>
    const res = await apiCall(reqPayload, options)
    
    const data = extractGeneratedData(res, '创建练习') as Record<string, unknown> | unknown[]
    const list = Array.isArray(data) ? data : (data as { dataList?: unknown[] }).dataList || data || []
    
    const parsed = z.array(questionSchema).parse(list)
    
    return {
      questionIds: parsed.map(q => q.id)
    }
  }

  async getQuestion(questionId: string, signal?: AbortSignal): Promise<Question> {
    const options = signal ? { signal } : {}
    const res = await apiExamV2AppSubjectGetSubjectsByIdsPost({
      ids: [questionId]
    }, options)
    
    const data = extractGeneratedData(res, '获取题目') as Record<string, unknown> | unknown[]
    const list = Array.isArray(data) ? data : (data as { dataList?: unknown[] }).dataList || data || []
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error('未找到该题目')
    }
    
    const parsed = questionSchema.parse(list[0])
    
    let type: QuestionType = 'unknown'
    let optionsArr: QuestionOption[] = []
    
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
      if (parsed.answer.length > 1) {
        type = 'multiple'
      } else {
        type = 'single'
      }
    }
    
    return {
      id: parsed.id,
      type,
      stemHtml: parsed.title,
      options: optionsArr,
      correctAnswers: Array.isArray(parsed.answer) ? parsed.answer : parsed.answer.split(''),
      explanationHtml: parsed.desc || null,
      isFavorite: parsed.isCollection,
      userAnswers: []
    }
  }

  async submitAnswer(input: SubmitAnswerInput, signal?: AbortSignal): Promise<DomainAnswerResult> {
    const options = signal ? { signal } : {}
    const res = await apiExamV2AppSubjectSubmitExerciseRecordPut({
      subjectList: [{
        id: input.questionId,
        isMistake: input.isMistake ?? false,
        isCollection: input.isFavorite ?? false,
        answer: input.answers.join(',')
      }],
      time: input.elapsedSeconds
    }, options)
    
    const data = extractGeneratedData(res, '提交答案')
    const parsed = answerResultSchema.parse(data)
    
    return {
      correct: parsed.subjectErrorCount === 0,
      correctAnswers: [],
      explanationHtml: null
    }
  }

  async toggleFavorite(questionId: string, favorite: boolean, signal?: AbortSignal): Promise<void> {
    const options = signal ? { signal } : {}
    await apiExamV2AppSubjectSubmitExerciseRecordPut({
      subjectList: [{
        id: questionId,
        isMistake: false, 
        isCollection: favorite,
        answer: ''
      }],
      time: 0
    }, options)
  }
}

export const questionBankRemote = new QuestionBankRemoteImpl()
