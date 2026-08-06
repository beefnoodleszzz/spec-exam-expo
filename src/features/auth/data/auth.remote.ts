/**
 * Authentication remote interface.
 *
 * All HTTP calls to auth endpoints go through this layer.
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

export interface AuthRemote {
  sendShortMessage(
    command: SendShortMessageCommand,
    signal?: AbortSignal,
  ): Promise<SendShortMessageResult>

  loginWithShortMessage(
    command: ShortMessageLoginCommand,
    signal?: AbortSignal,
  ): Promise<AuthSession>

  loginWithCode(
    command: V2LoginCommand,
    signal?: AbortSignal,
  ): Promise<AuthSession>

  loginWithOneClick(
    command: OneClickLoginCommand,
    signal?: AbortSignal,
  ): Promise<AuthSession>

  getCurrentUser(
    signal?: AbortSignal,
  ): Promise<AuthUser>
}
