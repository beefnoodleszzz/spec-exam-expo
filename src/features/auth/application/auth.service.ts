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

export interface AuthServiceDependencies {
  remote: AuthRemote
  persistSession(
    session: AuthSession,
  ): Promise<void>
  clearSession(): Promise<void>
  setUser(user: AuthUser): void
  clearUser(): void
}

export class AuthService {
  private activeLogin: Promise<void> | null =
    null
  private deps: AuthServiceDependencies

  constructor(deps: AuthServiceDependencies) {
    this.deps = deps
  }

  async sendShortMessage(
    command: SendShortMessageCommand,
    signal?: AbortSignal,
  ): Promise<SendShortMessageResult> {
    return this.deps.remote.sendShortMessage(
      command,
      signal,
    )
  }

  async loginWithShortMessage(
    command: ShortMessageLoginCommand,
    signal?: AbortSignal,
  ): Promise<void> {
    return this.runLogin(
      async () => {
        const session =
          await this.deps.remote.loginWithShortMessage(
            command,
            signal,
          )

        if (!session.accessToken) {
          throw new Error('Login returned no token')
        }

        await this.deps.persistSession(session)

        try {
          const user =
            await this.deps.remote.getCurrentUser(
              signal,
            )
          this.deps.setUser(user)
        } catch (error) {
          if (
            error instanceof Error &&
            error.name === 'UnauthorizedError'
          ) {
            await this.deps.clearSession()
            throw error
          }

          console.warn(
            'Failed to fetch user info after login:',
            error,
          )
        }
      },
    )
  }

  async loginWithCode(
    command: V2LoginCommand,
    signal?: AbortSignal,
  ): Promise<void> {
    return this.runLogin(
      async () => {
        const session =
          await this.deps.remote.loginWithCode(
            command,
            signal,
          )

        if (!session.accessToken) {
          throw new Error('Login returned no token')
        }

        await this.deps.persistSession(session)

        try {
          const user =
            await this.deps.remote.getCurrentUser(
              signal,
            )
          this.deps.setUser(user)
        } catch (error) {
          if (
            error instanceof Error &&
            error.name === 'UnauthorizedError'
          ) {
            await this.deps.clearSession()
            throw error
          }

          console.warn(
            'Failed to fetch user info after login:',
            error,
          )
        }
      },
    )
  }

  async loginWithOneClick(
    command: OneClickLoginCommand,
    signal?: AbortSignal,
  ): Promise<void> {
    return this.runLogin(
      async () => {
        const session =
          await this.deps.remote.loginWithOneClick(
            command,
            signal,
          )

        if (!session.accessToken) {
          throw new Error('Login returned no token')
        }

        await this.deps.persistSession(session)

        try {
          const user =
            await this.deps.remote.getCurrentUser(
              signal,
            )
          this.deps.setUser(user)
        } catch (error) {
          if (
            error instanceof Error &&
            error.name === 'UnauthorizedError'
          ) {
            await this.deps.clearSession()
            throw error
          }

          console.warn(
            'Failed to fetch user info after login:',
            error,
          )
        }
      },
    )
  }

  async logout(): Promise<void> {
    await this.deps.clearSession()
    this.deps.clearUser()
  }

  private async runLogin(
    task: () => Promise<void>,
  ): Promise<void> {
    if (this.activeLogin) {
      return this.activeLogin
    }

    this.activeLogin = task().finally(() => {
      this.activeLogin = null
    })

    return this.activeLogin
  }
}
