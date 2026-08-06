import { z } from 'zod'

export const subjectSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string().optional().default('未知科目'),
  // We extract whatever is available; backend might return tryOn or similar
  questionCount: z.number().nullable().optional(),
  progress: z.object({
    answered: z.number().default(0),
    correct: z.number().default(0),
    total: z.number().default(0),
  }).nullable().optional(),
}).passthrough()

export type SubjectDto = z.infer<typeof subjectSchema>
