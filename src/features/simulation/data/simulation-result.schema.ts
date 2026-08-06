import { z } from 'zod'

export const simulationResultSchema = z.object({
  paperId: z.string(),
  score: z.number().nonnegative(),
  totalScore: z.number().nonnegative(),
  correctCount: z.number().nonnegative(),
  wrongCount: z.number().nonnegative(),
  unansweredCount: z.number().nonnegative(),
  passed: z.boolean().nullable(),
  durationSeconds: z.number().nonnegative(),
  questionResults: z.array(
    z.object({
      questionId: z.string(),
      userAnswers: z.array(z.string()),
      isCorrect: z.boolean(),
      score: z.number().nonnegative(),
    }),
  ),
})
