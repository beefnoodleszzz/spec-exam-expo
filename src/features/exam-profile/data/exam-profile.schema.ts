import { z } from 'zod'

export const examTypeSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().optional(),
  examTypeName: z.string().optional(),
  title: z.string().optional(),
  provinceRequired: z.boolean().optional(),
}).passthrough()

export const examTypeListSchema = z.array(examTypeSchema)

export type ExamTypeResponseDto = z.infer<typeof examTypeSchema>
