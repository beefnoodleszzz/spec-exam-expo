/**
 * Authentication dependency container.
 *
 * Centralizes instantiation of all auth components.
 * Connects to existing Session Store and Auth User Store.
 */

import { sessionStore } from '@/shared/auth/session-store'
import { useAuthUserStore } from './state/auth-user.store'
import { AuthRemoteImpl } from './data/auth.remote.impl'
import { AuthService } from './application/auth.service'
import type { AuthService as IAuthService } from './application/auth.service'
import type { AuthUser } from './domain/auth.types'

let authRemoteInstance: AuthRemoteImpl | null = null
let authServiceInstance: AuthService | null = null

function getAuthRemote(): AuthRemoteImpl {
  if (!authRemoteInstance) {
    authRemoteInstance = new AuthRemoteImpl()
  }
  return authRemoteInstance
}

export function getAuthService(): IAuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService({
      remote: getAuthRemote(),

      persistSession: async (session) => {
        sessionStore.setState({
          accessToken: session.accessToken,
          userId: session.userId,
          status: 'authenticated',
        })
      },

      clearSession: async () => {
        sessionStore.setState({
          accessToken: null,
          userId: null,
          status: 'anonymous',
        })
      },

      setUser: (user: AuthUser) => {
        useAuthUserStore.getState().setUser(user)
      },

      clearUser: () => {
        useAuthUserStore.getState().clearUser()
      },
    })
  }
  return authServiceInstance
}

export function getAuthUserStore() {
  return useAuthUserStore
}

export function getAuthRemoteInstance() {
  return getAuthRemote()
}

export async function clearAuthenticatedState() {
  const authService = getAuthService()

  await authService.logout()
}
