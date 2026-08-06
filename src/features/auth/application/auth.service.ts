/**
 * Authentication service.
 *
 * Orchestrates login flow, session persistence, and user data fetching.
 * Single-flight prevents duplicate requests.
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
import type { AuthRemote } from '../data/auth.remote'
import {
  isUnauthorizedError,
  createContractError,
} from '@/shared/api/errors/app-error'
import type { AppError } from '@/shared/api/errors/app-error'
import { logger } from '@/shared/logging/logger'

export interface AuthServiceDependencies {
  remote: AuthRemote
  persistSession(session: AuthSession): Promise<void>
  clearSession(): Promise<void>
  setUser(user: AuthUser): void
  clearUser(): void
  onUserRestoreError?: (error: unknown) => void
}

export class AuthService {
  private activeLogin: Promise<void> | null = null
  private deps: AuthServiceDependencies

  constructor(deps: AuthServiceDependencies) {
    this.deps = deps
  }

  async sendShortMessage(
    command: SendShortMessageCommand,
    signal?: AbortSignal,
  ): Promise<SendShortMessageResult> {
    return this.deps.remote.sendShortMessage(command, signal)
  }

  async loginWithShortMessage(
    command: ShortMessageLoginCommand,
    signal?: AbortSignal,
  ): Promise<void> {
    return this.runLogin(async () => {
      await this.completeLogin(
        () => this.deps.remote.loginWithShortMessage(command, signal),
      )
    })
  }

  async loginWithCode(
    command: V2LoginCommand,
    signal?: AbortSignal,
  ): Promise<void> {
    return this.runLogin(async () => {
      await this.completeLogin(
        () => this.deps.remote.loginWithCode(command, signal),
      )
    })
  }

  async loginWithOneClick(
    command: OneClickLoginCommand,
    signal?: AbortSignal,
  ): Promise<void> {
    return this.runLogin(async () => {
      await this.completeLogin(
        () => this.deps.remote.loginWithOneClick(command, signal),
      )
    })
  }

  async logout(): Promise<void> {
    await this.deps.clearSession()
    this.deps.clearUser()
  }

  private async completeLogin(
    login: () => Promise<AuthSession>,
  ): Promise<void> {
    const session = await login()

    if (!session.accessToken) {
      throw createContractError('Login succeeded but no access token returned')
    }

    await this.deps.persistSession(session)

    try {
      const user = await this.deps.remote.getCurrentUser()
      this.deps.setUser(user)
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await this.deps.clearSession()
        this.deps.clearUser()
        throw error
      }

      if (this.deps.onUserRestoreError) {
        this.deps.onUserRestoreError(error)
      } else {
        logger.warn('auth_user_fetch_failed_after_login')
      }
    }
  }

  private async runLogin(task: () => Promise<void>): Promise<void> {
    if (this.activeLogin) {
      return this.activeLogin
    }

    this.activeLogin = task().finally(() => {
      this.activeLogin = null
    })

    return this.activeLogin
  }
}

// Re-export AppError for use by auth consumers
export type { AppError }
