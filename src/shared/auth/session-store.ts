/**
 * Session Store — Zustand store for authentication state.
 *
 * Single source of truth for runtime auth status (authenticated / anonymous).
 * Does NOT hold examTypeId (which lives exclusively in appStore.currentExamProfile).
 */
import { create } from 'zustand'
import {
  getSecure,
  setSecure,
  SecureKeys,
} from '@/shared/persistence/secure-storage'

export type SessionStatus = 'booting' | 'anonymous' | 'authenticated'

export interface SessionState {
  status: SessionStatus
  accessToken: string | null
  userId: string | null

  // Called when login succeeds
  setSession: (params: { token: string; userId: string }) => Promise<void>
  // Called during bootstrap to restore persisted token
  restoreSession: () => Promise<void>
}

export const sessionStore = create<SessionState>((set) => ({
  status: 'booting',
  accessToken: null,
  userId: null,

  setSession: async ({ token, userId }) => {
    await setSecure(SecureKeys.ACCESS_TOKEN, token)
    await setSecure(SecureKeys.USER_ID, userId)
    set({ status: 'authenticated', accessToken: token, userId })
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
}))
