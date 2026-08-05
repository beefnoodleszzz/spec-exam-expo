/**
 * Question Domain Model
 *
 * This is the canonical client-side representation of a question.
 * Generated DTOs must be converted to this type via adapters.
 * Business logic must only operate on this type, never on raw DTOs.
 */

export type QuestionType = 'single-choice' | 'multiple-choice' | 'boolean' | 'unknown'

export interface RichContent {
  /** Raw text / HTML content */
  raw: string
  /** Whether the content contains HTML tags */
  isHtml: boolean
}

export interface QuestionOption {
  /** e.g. 'A', 'B', 'C', 'D' */
  label: string
  content: RichContent
}

export type AnswerValue = string | string[]

export interface SubmittedAnswer {
  questionId: string
  value: AnswerValue
  isCorrect: boolean
  submittedAt: string
}

export interface Question {
  id: string
  type: QuestionType
  stem: RichContent
  options: QuestionOption[]
  /** The correct answer value — used for evaluation */
  correctAnswer: AnswerValue
  explanation?: RichContent
  favorite: boolean
  /** Set after user answers */
  userAnswer?: AnswerValue
}

// ---- Practice Session ----

export type PracticeMode = 'sequential' | 'quick' | 'paper' | 'wrong' | 'favorites'

export interface PracticeSessionState {
  mode: PracticeMode
  questions: Question[]
  currentIndex: number
  answers: Record<string, SubmittedAnswer>
  correctCount: number
  wrongCount: number
  status: 'loading' | 'active' | 'completed' | 'error'
}

/** Lightweight snapshot persisted to AsyncStorage */
export interface PersistedPracticeSnapshot {
  schemaVersion: 1
  userId: string
  mode: PracticeMode
  sessionKey: string
  questionIds: string[]
  currentIndex: number
  answers: Record<string, SubmittedAnswer>
  correctCount: number
  wrongCount: number
  startedAt: string
  updatedAt: string
}

// ---- Simulation Exam ----

export type SimulationStatus =
  | 'loading'
  | 'active'
  | 'submitting'
  | 'submitted'
  | 'expired'
  | 'error'

export interface SimulationState {
  examId: string
  paperId: string
  startedAt: string
  /** ISO timestamp — real remaining time is Math.max(0, expiresAt - Date.now()) */
  expiresAt: string
  questions: Question[]
  answers: Record<string, SubmittedAnswer>
  currentIndex: number
  status: SimulationStatus
}

/** Lightweight snapshot persisted to AsyncStorage */
export interface PersistedSimulationSnapshot {
  schemaVersion: 1
  userId: string
  examId: string
  paperId: string
  startedAt: string
  expiresAt: string
  currentIndex: number
  answers: Record<string, SubmittedAnswer>
  submissionStatus: 'active' | 'submitting' | 'submitted'
}
