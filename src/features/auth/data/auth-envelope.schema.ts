import { z } from 'zod'

/**
 * Authentication envelope schema — validates outer wrapper only.
 *
 * The data field is NOT typed here, as its structure is determined
 * by runtime evidence, not specification guessing.
 */
export const authEnvelopeSchema = z.object({
  status: z.boolean().optional(),
  code: z
    .union([z.string(), z.number()])
    .optional(),
  StatusCode: z
    .union([z.string(), z.number()])
    .optional(),
  message: z.string().optional(),
  data: z.unknown().optional(),
})

export type AuthEnvelope = z.infer<
  typeof authEnvelopeSchema
>
