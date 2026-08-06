import { z } from 'zod'

export const simulationHistoryItemSchema = z.object({
  resultId: z.string(),
  paperId: z.string(),
  title: z.string(),
  score: z.number().nonnegative(),
  passScore: z.number().nullable(),
  passed: z.boolean().nullable(),
  durationSeconds: z.number().nonnegative(),
  createdAt: z.string().datetime(),
})
