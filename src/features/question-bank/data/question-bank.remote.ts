import type { Subject } from '../domain/subject.types'
import type { Chapter } from '../domain/chapter.types'
import type { Question } from '../domain/question.types'

export interface PracticeSessionSeed {
  questionIds: string[]
}

export interface SubmitAnswerInput {
  questionId: string
  answers: string[]
  elapsedSeconds: number
  isMistake?: boolean
  isFavorite?: boolean
}

export interface AnswerResult {
  correct: boolean
  correctAnswers: string[]
  explanationHtml: string | null
}

export interface QuestionBankRemote {
  listSubjects(examTypeId: string, signal?: AbortSignal): Promise<Subject[]>
  listChapters(subjectId: string, signal?: AbortSignal): Promise<Chapter[]>
  createOrderPractice(examTypeId: string, subjectId: string, chapterId?: string, signal?: AbortSignal): Promise<PracticeSessionSeed>
  createRandomPractice(examTypeId: string, subjectId: string, signal?: AbortSignal): Promise<PracticeSessionSeed>
  listWrongQuestions(examTypeId: string, subjectId: string, signal?: AbortSignal): Promise<PracticeSessionSeed>
  listFavoriteQuestions(examTypeId: string, subjectId: string, signal?: AbortSignal): Promise<PracticeSessionSeed>
  getQuestionsByIds(ids: string[], signal?: AbortSignal): Promise<Question[]>
  submitExerciseRecord(input: SubmitAnswerInput, signal?: AbortSignal): Promise<AnswerResult>
  toggleCollection(questionId: string, favorite: boolean, signal?: AbortSignal): Promise<void>
}
