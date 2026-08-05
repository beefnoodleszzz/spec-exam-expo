/**
 * Pure business functions for the question/answer domain.
 *
 * ALL functions must be pure (no side effects, no imports from UI layer).
 * These are the unit-test-critical functions per the guide spec.
 */
import type {
  AnswerValue,
  Question,
  QuestionType,
  RichContent,
  SubmittedAnswer,
} from './question.types'

// ---- Answer normalization ----

/**
 * Normalize an answer value to a canonical form.
 * Single-choice/boolean: string
 * Multiple-choice: sorted string[]
 */
export function normalizeAnswer(value: AnswerValue): AnswerValue {
  if (Array.isArray(value)) {
    return sortAnswer(value)
  }
  return String(value).trim().toUpperCase()
}

/** Sort a multiple-choice answer array for consistent comparison */
export function sortAnswer(options: string[]): string[] {
  return [...options].sort()
}

/** Check if a multiple-choice answer has at least one selection */
export function isAnswerComplete(value: AnswerValue | undefined): boolean {
  if (value == null) return false
  if (Array.isArray(value)) return value.length > 0
  return String(value).trim().length > 0
}

// ---- Answer evaluation ----

/**
 * Compare user answer to correct answer.
 * For multiple-choice: order-independent set comparison.
 */
export function evaluateAnswer(userAnswer: AnswerValue, correctAnswer: AnswerValue): boolean {
  const normalized = normalizeAnswer(userAnswer)
  const correct = normalizeAnswer(correctAnswer)

  if (Array.isArray(normalized) && Array.isArray(correct)) {
    return (
      normalized.length === correct.length &&
      normalized.every((v, i) => v === correct[i])
    )
  }

  return normalized === correct
}

// ---- Progress calculation ----

export interface PracticeProgress {
  total: number
  answered: number
  correctCount: number
  wrongCount: number
  unansweredCount: number
  accuracy: number
}

export function calculatePracticeProgress(
  questions: Question[],
  answers: Record<string, SubmittedAnswer>,
): PracticeProgress {
  const total = questions.length
  const answered = Object.keys(answers).length
  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length
  const wrongCount = answered - correctCount
  const unansweredCount = total - answered
  const accuracy = answered === 0 ? 0 : Math.round((correctCount / answered) * 100)

  return { total, answered, correctCount, wrongCount, unansweredCount, accuracy }
}

// ---- Exam score calculation ----

export interface ExamScore {
  totalQuestions: number
  correctCount: number
  wrongCount: number
  unansweredCount: number
  score: number
  passed: boolean
  accuracy: number
}

/**
 * Calculate exam score.
 * Pass threshold: 80 points (standard for special operations exams).
 */
export function calculateExamScore(
  questions: Question[],
  answers: Record<string, SubmittedAnswer>,
  totalPoints = 100,
): ExamScore {
  const totalQuestions = questions.length
  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length
  const answered = Object.keys(answers).length
  const wrongCount = answered - correctCount
  const unansweredCount = totalQuestions - answered

  const score =
    totalQuestions === 0
      ? 0
      : Math.round((correctCount / totalQuestions) * totalPoints)

  const passed = score >= 80
  const accuracy = answered === 0 ? 0 : Math.round((correctCount / answered) * 100)

  return { totalQuestions, correctCount, wrongCount, unansweredCount, score, passed, accuracy }
}

// ---- Rich content normalization ----

export function normalizeRichContent(raw: string | null | undefined): RichContent {
  const text = raw ?? ''
  // Detect HTML by presence of tags
  const isHtml = /<[a-z][\s\S]*>/i.test(text)
  return { raw: text, isHtml }
}

// ---- Type normalization ----

const TYPE_MAP: Record<string | number, QuestionType> = {
  0: 'single-choice',
  1: 'multiple-choice',
  2: 'boolean',
  single: 'single-choice',
  multi: 'multiple-choice',
  bool: 'boolean',
  判断题: 'boolean',
  单选题: 'single-choice',
  多选题: 'multiple-choice',
}

export function normalizeQuestionType(raw: unknown): QuestionType {
  if (raw == null) return 'unknown'
  return TYPE_MAP[String(raw)] ?? 'unknown'
}

// ---- Countdown ----

/**
 * Get the real remaining seconds based on absolute expiresAt timestamp.
 * UI may call this every second, but business logic must use this — not a
 * running counter that drifts when the app goes to background.
 */
export function getRemainingSeconds(expiresAt: string): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
}

// ---- Money formatting ----

/** Format integer cents to display string: 100 → '1.00' */
export function formatCents(cents: number): string {
  return (cents / 100).toFixed(2)
}

/** Format integer cents to yuan display: 100 → '¥1.00' */
export function formatYuan(cents: number): string {
  return `¥${formatCents(cents)}`
}
