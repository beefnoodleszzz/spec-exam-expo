import { z } from 'zod'
import {
  createContractError,
} from './errors/app-error'

const generatedEnvelopeSchema =
  z.object({
    data: z.unknown().optional(),
  })
  .passthrough()

export function extractGeneratedData(
  responseBody: unknown,
  context: string,
): unknown {
  const envelope =
    generatedEnvelopeSchema.safeParse(
      responseBody,
    )

  if (!envelope.success) {
    throw createContractError(
      `${context}响应结构错误`,
      envelope.error,
    )
  }

  if (
    envelope.data.data === undefined ||
    envelope.data.data === null
  ) {
    throw createContractError(
      `${context}未返回业务数据`,
    )
  }

  return envelope.data.data
}
