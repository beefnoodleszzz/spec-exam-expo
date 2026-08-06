import { z } from 'zod'

export const questionSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: z.string().optional().default('未知题目'),
  selection: z.union([z.string(), z.array(z.string())]).optional(),
  answer: z.union([z.string(), z.array(z.string())]).optional().default(''),
  desc: z.string().optional(),
  isCollection: z.boolean().optional().default(false),
  isMistake: z.boolean().optional().default(false),
  type: z.string().optional(), // For flexibility
}).passthrough()

export type QuestionDto = z.infer<typeof questionSchema>
