import { z } from 'zod'

export const simulationResultDtoSchema = z.object({
  score: z.number().optional().nullable(),
  subjectCorrectCount: z.number().optional().nullable(),
  subjectErrorCount: z.number().optional().nullable(),
  isPass: z.boolean().optional().nullable(),
  time: z.number().optional().nullable(),
}).passthrough()

export type SimulationResultDto = z.infer<typeof simulationResultDtoSchema>
