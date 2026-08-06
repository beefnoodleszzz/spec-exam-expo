import { z } from 'zod'

export const simulationRuleSchema = z.object({
  examTypeId: z.string(),
  durationSeconds: z.number().nonnegative(),
  totalQuestions: z.number().nonnegative(),
  totalScore: z.number().nullable(),
  passScore: z.number().nullable(),
})
