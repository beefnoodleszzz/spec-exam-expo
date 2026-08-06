import { z } from 'zod'

export const simulationPaperSchema = z.object({
  paperId: z.string(),
  title: z.string(),
  durationSeconds: z.number().nonnegative(),
  questions: z.array(
    z.object({
      questionId: z.string(),
      subjectId: z.string().nullable(),
      score: z.number().nullable(),
      order: z.number().nonnegative(),
    }),
  ),
  startedAt: z.string().datetime(),
  expiresAt: z.string().datetime().nullable(),
})
