import { z } from 'zod'

export const chapterBaseSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string().optional().default('未知章节'),
  questionCount: z.number().optional().default(0),
  answeredCount: z.number().optional().default(0),
}).passthrough()

export type ChapterDto = {
  id: string
  name: string
  questionCount: number
  answeredCount: number
  children: ChapterDto[]
}

export const chapterSchema: z.ZodType<ChapterDto> = z.lazy(() => 
  chapterBaseSchema.extend({
    children: z.array(chapterSchema).default([]),
  })
)
