/**
 * Auth user profile store.
 *
 * Stores current user information separate from session.
 * Persisted to AsyncStorage (non-sensitive data only).
 * Validated via Zod on restore to prevent silent contract coercion.
 */

import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { AuthUser } from '../domain/auth.types'
import { persistedAuthUserSchema } from './auth-user.persistence.schema'
import { logger, sanitizeError } from '@/shared/logging/logger'

const STORAGE_KEY = 'auth-user-profile'

type LoadingState = 'idle' | 'loading' | 'ready' | 'error'

interface AuthUserStoreState {
  user: AuthUser | null
  status: LoadingState

  setLoading(): void
  setUser(user: AuthUser): void
  setError(): void
  clearUser(): void
  restoreFromStorage(): Promise<void>
}

export const useAuthUserStore = create<AuthUserStoreState>(
  (set) => ({
    user: null,
    status: 'idle',

    setLoading() {
      set({ status: 'loading' })
    },

    setUser(user: AuthUser) {
      set({ user, status: 'ready' })
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user)).catch(() => {
        logger.warn('auth_user_persist_failed')
      })
    },

    setError() {
      set({ status: 'error' })
    },

    clearUser() {
      set({ user: null, status: 'idle' })
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {
        logger.warn('auth_user_clear_failed')
      })
    },

    async restoreFromStorage() {
      set({ status: 'loading' })
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY)
        if (!data) {
          set({ status: 'idle' })
          return
        }

        let parsed: unknown
        try {
          parsed = JSON.parse(data)
        } catch {
          await AsyncStorage.removeItem(STORAGE_KEY)
          set({ user: null, status: 'error' })
          return
        }

        const result = persistedAuthUserSchema.safeParse(parsed)

        if (!result.success) {
          await AsyncStorage.removeItem(STORAGE_KEY)
          set({ user: null, status: 'error' })
          return
        }

        set({ user: result.data, status: 'ready' })
      } catch (err) {
        logger.warn('auth_user_restore_failed', { error: sanitizeError(err) })
        set({ status: 'error' })
      }
    },
  }),
)

export function createAuthUserStore() {
  return useAuthUserStore
}

export function useAuthUser() {
  return useAuthUserStore((state) => state.user)
}

export function useAuthUserStatus() {
  return useAuthUserStore((state) => state.status)
}
