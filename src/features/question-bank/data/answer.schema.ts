import { z } from 'zod'

export const answerResultSchema = z.object({
  subjectCount: z.number().optional().default(0),
  subjectCorrectCount: z.number().optional().default(0),
  subjectErrorCount: z.number().optional().default(0),
  ratio: z.number().optional().default(0),
  score: z.number().optional().default(0),
  time: z.number().optional().default(0),
  isPass: z.boolean().optional().default(false),
}).passthrough()

export type AnswerResultDto = z.infer<typeof answerResultSchema>
