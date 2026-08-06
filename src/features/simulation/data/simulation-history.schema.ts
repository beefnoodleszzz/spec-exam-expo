import { z } from 'zod'

export const simulationHistoryDtoSchema = z.object({
  examTypeName: z.string().optional().nullable(),
  gradeHistories: z.array(
    z.object({
      score: z.number().optional().nullable(),
      isPass: z.boolean().optional().nullable(),
      time: z.number().optional().nullable(),
      createTime: z.string().optional().nullable(),
    }).passthrough()
  ).optional().nullable()
}).passthrough()

export type SimulationHistoryDto = z.infer<typeof simulationHistoryDtoSchema>
