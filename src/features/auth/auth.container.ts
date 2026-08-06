/**
 * Authentication dependency container.
 *
 * Connects AuthService to real Session Service, Session Store,
 * Auth User Store, Query Client, and Exam Profile Store.
 *
 * Module-level singletons — no lazy getter boilerplate needed.
 */

import { sessionStore } from '@/shared/auth/session-store'
import { clearAllSessionData } from '@/shared/auth/session-service'
import { useAuthUserStore } from './state/auth-user.store'
import { AuthRemoteImpl } from './data/auth.remote.impl'
import { AuthService } from './application/auth.service'
import type { AuthService as IAuthService } from './application/auth.service'
import type { AuthUser } from './domain/auth.types'

// ─── Production singletons ────────────────────────────────────────────────────

export const authRemote = new AuthRemoteImpl()

export const authService: IAuthService = new AuthService({
  remote: authRemote,

  persistSession: async (session) => {
    // Persist to SecureStore and update in-memory store atomically
    await sessionStore.getState().setSession({
      token: session.accessToken,
      userId: session.userId ?? '',
    })
  },

  clearSession: async () => {
    // Full cleanup: SecureStore + Session Store + Auth User Store + Query + Exam Profile
    await clearAllSessionData()
  },

  setUser: (user: AuthUser) => {
    useAuthUserStore.getState().setUser(user)
  },

  clearUser: () => {
    useAuthUserStore.getState().clearUser()
  },
})

// ─── Convenience accessors ────────────────────────────────────────────────────

/**
 * Returns the production AuthService singleton.
 * Kept as function for test-injection compatibility.
 */
export function getAuthService(): IAuthService {
  return authService
}

/**
 * Clear all authenticated state:
 * SecureStore, Session Store, Auth User Store, Query Cache, Exam Profile.
 *
 * Does NOT navigate — Route Guard handles redirection.
 */
export async function clearAuthenticatedState(): Promise<void> {
  await clearAllSessionData()
  useAuthUserStore.getState().clearUser()
}
