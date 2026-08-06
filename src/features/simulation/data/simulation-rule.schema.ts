import { z } from 'zod'

export const simulationRuleDtoSchema = z.object({
  time: z.number().optional().nullable(),
  subjectCount: z.number().optional().nullable(),
}).passthrough()

export type SimulationRuleDto = z.infer<typeof simulationRuleDtoSchema>
