import { describe, it, expect } from 'vitest'
import {
  normalizeAnswer,
  sortAnswer,
  isAnswerComplete,
  evaluateAnswer,
  calculatePracticeProgress,
  calculateExamScore,
  getRemainingSeconds,
  formatCents,
  formatYuan,
  normalizeQuestionType,
} from '../question.utils'
import type { Question, SubmittedAnswer } from '../question.types'

describe('normalizeAnswer', () => {
  it('uppercases single-choice string', () => {
    expect(normalizeAnswer('a')).toBe('A')
  })
  it('sorts multiple-choice array', () => {
    expect(normalizeAnswer(['C', 'A', 'B'])).toEqual(['A', 'B', 'C'])
  })
})

describe('sortAnswer', () => {
  it('returns sorted copy', () => {
    expect(sortAnswer(['D', 'B'])).toEqual(['B', 'D'])
  })
  it('does not mutate original', () => {
    const arr = ['B', 'A']
    sortAnswer(arr)
    expect(arr).toEqual(['B', 'A'])
  })
})

describe('isAnswerComplete', () => {
  it('returns false for undefined', () => {
    expect(isAnswerComplete(undefined)).toBe(false)
  })
  it('returns false for empty array', () => {
    expect(isAnswerComplete([])).toBe(false)
  })
  it('returns true for non-empty array', () => {
    expect(isAnswerComplete(['A'])).toBe(true)
  })
  it('returns true for non-empty string', () => {
    expect(isAnswerComplete('A')).toBe(true)
  })
})

describe('evaluateAnswer', () => {
  it('correct single choice', () => {
    expect(evaluateAnswer('A', 'A')).toBe(true)
  })
  it('wrong single choice', () => {
    expect(evaluateAnswer('B', 'A')).toBe(false)
  })
  it('case insensitive', () => {
    expect(evaluateAnswer('a', 'A')).toBe(true)
  })
  it('correct multiple choice (order insensitive)', () => {
    expect(evaluateAnswer(['C', 'A'], ['A', 'C'])).toBe(true)
  })
  it('wrong multiple choice (missing option)', () => {
    expect(evaluateAnswer(['A'], ['A', 'C'])).toBe(false)
  })
})

const makeQ = (id: string): Question => ({
  id,
  type: 'single-choice',
  stem: { raw: 'test', isHtml: false },
  options: [],
  correctAnswer: 'A',
  favorite: false,
})

const makeAnswer = (questionId: string, isCorrect: boolean): SubmittedAnswer => ({
  questionId,
  value: isCorrect ? 'A' : 'B',
  isCorrect,
  submittedAt: new Date().toISOString(),
})

describe('calculatePracticeProgress', () => {
  it('calculates correct progress', () => {
    const questions = [makeQ('1'), makeQ('2'), makeQ('3')]
    const answers: Record<string, SubmittedAnswer> = {
      '1': makeAnswer('1', true),
      '2': makeAnswer('2', false),
    }
    const progress = calculatePracticeProgress(questions, answers)
    expect(progress.total).toBe(3)
    expect(progress.answered).toBe(2)
    expect(progress.correctCount).toBe(1)
    expect(progress.wrongCount).toBe(1)
    expect(progress.unansweredCount).toBe(1)
    expect(progress.accuracy).toBe(50)
  })
})

describe('calculateExamScore', () => {
  it('calculates passing score', () => {
    const questions = Array.from({ length: 10 }, (_, i) => makeQ(String(i)))
    const answers = Object.fromEntries(
      questions.slice(0, 9).map((q) => [q.id, makeAnswer(q.id, true)]),
    )
    const score = calculateExamScore(questions, answers)
    expect(score.score).toBe(90)
    expect(score.passed).toBe(true)
  })

  it('calculates failing score', () => {
    const questions = Array.from({ length: 10 }, (_, i) => makeQ(String(i)))
    const answers = Object.fromEntries(
      questions.slice(0, 5).map((q) => [q.id, makeAnswer(q.id, true)]),
    )
    const score = calculateExamScore(questions, answers)
    expect(score.score).toBe(50)
    expect(score.passed).toBe(false)
  })
})

describe('getRemainingSeconds', () => {
  it('returns 0 for past time', () => {
    const past = new Date(Date.now() - 10_000).toISOString()
    expect(getRemainingSeconds(past)).toBe(0)
  })

  it('returns positive number for future time', () => {
    const future = new Date(Date.now() + 60_000).toISOString()
    const remaining = getRemainingSeconds(future)
    expect(remaining).toBeGreaterThan(0)
    expect(remaining).toBeLessThanOrEqual(60)
  })
})

describe('money formatting', () => {
  it('formatCents', () => {
    expect(formatCents(100)).toBe('1.00')
    expect(formatCents(1050)).toBe('10.50')
    expect(formatCents(0)).toBe('0.00')
  })

  it('formatYuan', () => {
    expect(formatYuan(100)).toBe('¥1.00')
  })
})

describe('normalizeQuestionType', () => {
  it('maps numeric types', () => {
    expect(normalizeQuestionType(0)).toBe('single-choice')
    expect(normalizeQuestionType(1)).toBe('multiple-choice')
    expect(normalizeQuestionType(2)).toBe('boolean')
  })

  it('returns unknown for unmapped values', () => {
    expect(normalizeQuestionType('xyz')).toBe('unknown')
    expect(normalizeQuestionType(null)).toBe('unknown')
  })
})
