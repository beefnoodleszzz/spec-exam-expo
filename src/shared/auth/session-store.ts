/**
 * Session Store — Zustand store for authentication state.
 *
 * Single source of truth for runtime auth status (authenticated / anonymous).
 * Does NOT hold examTypeId (which lives exclusively in appStore.currentExamProfile).
 */
import { create } from 'zustand'
import {
  getSecure,
  SecureKeys,
} from '@/shared/persistence/secure-storage'

export type SessionStatus = 'booting' | 'anonymous' | 'authenticated'

export interface SessionState {
  status: SessionStatus
  accessToken: string | null
  userId: string | null

  // Called during bootstrap to restore persisted token
  restoreSession: () => Promise<void>
  clearSession: () => void
}

export const sessionStore = create<SessionState>((set) => ({
  status: 'booting',
  accessToken: null,
  userId: null,

  clearSession: () => set((_state) => {
    import('../../features/question-bank/state/practice-session.store').then(module => {
      module.usePracticeSessionStore.getState().actions.clearSession()
    }).catch(() => {})

    import('../../features/simulation/state/simulation-session.store').then(module => {
      module.useSimulationSessionStore.getState().clearAllSessions()
    }).catch(() => {})

    import('../../shared/query/query-client').then(module => {
      module.queryClient.clear()
    }).catch(() => {})
    
    return {
      status: 'anonymous',
      accessToken: null,
      userId: null,
    }
  }),

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
