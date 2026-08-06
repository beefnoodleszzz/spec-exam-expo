import type { Subject } from '../domain/subject.types'
import type { Chapter } from '../domain/chapter.types'
import type { Question } from '../domain/question.types'
import type { PracticeMode } from '../domain/practice.types'

export interface CreatePracticeInput {
  examTypeId: string
  subjectId: string
  chapterId: string | null
  mode: PracticeMode
}

export interface PracticeSessionSeed {
  questionIds: string[]
}

export interface SubmitAnswerInput {
  questionId: string
  answers: string[]
  elapsedSeconds: number
  practiceMode: PracticeMode
  isMistake?: boolean
  isFavorite?: boolean
}

export interface AnswerResult {
  correct: boolean
  correctAnswers: string[]
  explanationHtml: string | null
}

export interface QuestionBankRemote {
  listSubjects(
    examTypeId: string,
    signal?: AbortSignal,
  ): Promise<Subject[]>

  listChapters(
    subjectId: string,
    signal?: AbortSignal,
  ): Promise<Chapter[]>

  createPractice(
    input: CreatePracticeInput,
    signal?: AbortSignal,
  ): Promise<PracticeSessionSeed>

  getQuestion(
    questionId: string,
    signal?: AbortSignal,
  ): Promise<Question>

  submitAnswer(
    input: SubmitAnswerInput,
    signal?: AbortSignal,
  ): Promise<AnswerResult>

  toggleFavorite(
    questionId: string,
    favorite: boolean,
    signal?: AbortSignal,
  ): Promise<void>
}
