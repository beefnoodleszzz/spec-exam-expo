/**
 * Authentication remote implementation.
 *
 * Calls V2 Generated API endpoints.
 * Handles envelope unwrapping and contract validation.
 *
 * Evidence: docs/auth/legacy-auth-mapping.md
 */

import type {
  AuthSession,
  AuthUser,
  OneClickLoginCommand,
  SendShortMessageCommand,
  SendShortMessageResult,
  ShortMessageLoginCommand,
  V2LoginCommand,
} from '../domain/auth.types'
import type { AuthRemote } from './auth.remote'
import {
  apiExamV2AppLoginShortMessagePost,
  apiExamV2AppLoginPost,
  apiExamV2AppLoginSendShortMessageGet,
  apiExamV2AppLoginGetUserInfoByTokenGet,
  apiExamV2AppUserDetailGet,
} from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2'
import {
  authEnvelopeSchema,
} from './auth-envelope.schema'
import {
  authLoginPayloadSchema,
  authUserPayloadSchema,
  sendShortMessagePayloadSchema,
  extractAccessToken,
  extractUserId,
  extractRequestId,
  mapAuthUser,
} from './auth-payload.schema'
import {
  mapShortMessageLogin,
  mapV2Login,
  mapOneClickLogin,
  mapSendShortMessage,
} from './auth.request-mapper'

function createContractError(message: string): Error {
  const error = new Error(message)
  error.name = 'ContractError'
  return error
}

function parseEnvelopeData(
  responseBody: unknown,
): unknown {
  const envelope = authEnvelopeSchema.parse(
    responseBody,
  )

  if (
    envelope.data === undefined ||
    envelope.data === null
  ) {
    throw createContractError(
      'Authentication response has no data payload',
    )
  }

  return envelope.data
}

function getRequestOptions(signal?: AbortSignal) {
  const options: RequestInit = {}
  if (signal !== undefined) {
    options.signal = signal
  }
  return options
}

export class AuthRemoteImpl implements AuthRemote {
  async sendShortMessage(
    command: SendShortMessageCommand,
    signal?: AbortSignal,
  ): Promise<SendShortMessageResult> {
    const dto = mapSendShortMessage(command)
    const response =
      await apiExamV2AppLoginSendShortMessageGet(
        dto,
        getRequestOptions(signal),
      )

    const data = parseEnvelopeData(response)
    const payload =
      sendShortMessagePayloadSchema.parse(data)
    const requestId = extractRequestId(payload)

    return { requestId }
  }

  async loginWithShortMessage(
    command: ShortMessageLoginCommand,
    signal?: AbortSignal,
  ): Promise<AuthSession> {
    const dto = mapShortMessageLogin(command)
    const response =
      await apiExamV2AppLoginShortMessagePost(
        dto,
        getRequestOptions(signal),
      )

    const data = parseEnvelopeData(response)
    const payload =
      authLoginPayloadSchema.parse(data)
    const accessToken =
      extractAccessToken(payload)
    const userId = extractUserId(payload)

    return { accessToken, userId }
  }

  async loginWithCode(
    command: V2LoginCommand,
    signal?: AbortSignal,
  ): Promise<AuthSession> {
    const dto = mapV2Login(command)
    const response =
      await apiExamV2AppLoginPost(
        dto,
        getRequestOptions(signal),
      )

    const data = parseEnvelopeData(response)
    const payload =
      authLoginPayloadSchema.parse(data)
    const accessToken =
      extractAccessToken(payload)
    const userId = extractUserId(payload)

    return { accessToken, userId }
  }

  async loginWithOneClick(
    command: OneClickLoginCommand,
    signal?: AbortSignal,
  ): Promise<AuthSession> {
    const dto = mapOneClickLogin(command)
    const response =
      await apiExamV2AppLoginPost(
        dto,
        getRequestOptions(signal),
      )

    const data = parseEnvelopeData(response)
    const payload =
      authLoginPayloadSchema.parse(data)
    const accessToken =
      extractAccessToken(payload)
    const userId = extractUserId(payload)

    return { accessToken, userId }
  }

  async getCurrentUser(
    signal?: AbortSignal,
  ): Promise<AuthUser> {
    let response: unknown

    try {
      response =
        await apiExamV2AppUserDetailGet(
          getRequestOptions(signal),
        )
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('404')
      ) {
        response =
          await apiExamV2AppLoginGetUserInfoByTokenGet(
            getRequestOptions(signal),
          )
      } else {
        throw error
      }
    }

    const data = parseEnvelopeData(response)
    const payload =
      authUserPayloadSchema.parse(data)
    const user = mapAuthUser(payload)

    return user
  }
}
