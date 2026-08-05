/**
 * Session Store — Zustand store for authentication state.
 *
 * This is the single source of truth for auth status.
 * The HTTP client reads from it. The route guard observes it.
 * The 401 handler writes to it.
 *
 * Rules:
 * - Token is in SecureStore (persistent) + memory (fast access).
 * - This store holds the runtime copy.
 * - Logout and 401 both call clearSession().
 * - Navigation happens in the route guard, not here.
 */
import { create } from 'zustand'
import {
  getSecure,
  setSecure,
  clearSecureCredentials,
  SecureKeys,
} from '@/shared/persistence/secure-storage'
import { clearUserAsyncData } from '@/shared/persistence/async-storage'

export type SessionStatus = 'booting' | 'anonymous' | 'authenticated'

export interface SessionState {
  status: SessionStatus
  accessToken: string | null
  userId: string | null
  examTypeId: string | null

  // Called when login succeeds
  setSession: (params: { token: string; userId: string }) => Promise<void>
  // Called on logout or 401
  clearSession: () => Promise<void>
  // Called specifically by the HTTP client on 401 (same as clearSession here)
  handleUnauthorized: () => void
  // Called during bootstrap to restore persisted token
  restoreSession: () => Promise<void>
  // Update examTypeId (stored separately in exam profile)
  setExamTypeId: (id: string | null) => void
}

export const sessionStore = create<SessionState>((set, get) => ({
  status: 'booting',
  accessToken: null,
  userId: null,
  examTypeId: null,

  setSession: async ({ token, userId }) => {
    await setSecure(SecureKeys.ACCESS_TOKEN, token)
    await setSecure(SecureKeys.USER_ID, userId)
    set({ status: 'authenticated', accessToken: token, userId })
  },

  clearSession: async () => {
    await clearSecureCredentials()
    await clearUserAsyncData()
    set({ status: 'anonymous', accessToken: null, userId: null, examTypeId: null })
  },

  handleUnauthorized: () => {
    // Synchronously mark as anonymous so route guard can redirect
    // Full cleanup is done async in clearSession()
    set({ status: 'anonymous', accessToken: null, userId: null })
    // Kick off async cleanup without blocking
    void get().clearSession()
  },

  restoreSession: async () => {
    try {
      const token = await getSecure(SecureKeys.ACCESS_TOKEN)
      const userId = await getSecure(SecureKeys.USER_ID)
      if (token && userId) {
        set({ status: 'authenticated', accessToken: token, userId })
      } else {
        set({ status: 'anonymous' })
      }
    } catch {
      set({ status: 'anonymous' })
    }
  },

  setExamTypeId: (id) => {
    set({ examTypeId: id })
  },
}))

/** Read-only selector for the HTTP client (avoids subscribe overhead) */
export function getSessionSnapshot(): {
  accessToken: string | null
  examTypeId: string | null
} {
  const s = sessionStore.getState()
  return { accessToken: s.accessToken, examTypeId: s.examTypeId }
}
