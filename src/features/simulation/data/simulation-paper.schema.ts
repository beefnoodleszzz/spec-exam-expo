import { z } from 'zod'

export const simulationPaperDtoSchema = z.object({
  dataList: z.array(
    z.object({
      id: z.string().optional().nullable(),
    }).passthrough()
  ).optional().nullable()
}).passthrough()

export type SimulationPaperDto = z.infer<typeof simulationPaperDtoSchema>
