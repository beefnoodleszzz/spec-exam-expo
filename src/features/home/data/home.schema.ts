import { z } from 'zod'

export const homeInformationSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  createTime: z.string().optional(),
}).passthrough()

export const homeResponseSchema = z.object({
  examDay: z.number().nullable().optional(),
  totalSubject: z.number().optional().default(0),
  totalAnswer: z.number().optional().default(0),
  answerRate: z.string().optional().default('0%'),
  informationList: z.object({
    dataList: z.array(homeInformationSchema).optional(),
  }).optional(),
}).passthrough()

export type HomeResponseDto = z.infer<typeof homeResponseSchema>
