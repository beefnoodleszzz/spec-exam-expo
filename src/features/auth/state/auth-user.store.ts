/**
 * Auth user profile store.
 *
 * Stores current user information separate from session.
 * Persisted to AsyncStorage (non-sensitive data only).
 */

import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { AuthUser } from '../domain/auth.types'

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
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user)).catch(
        (err) => {
          console.warn('Failed to persist user profile:', err)
        },
      )
    },

    setError() {
      set({ status: 'error' })
    },

    clearUser() {
      set({ user: null, status: 'idle' })
      AsyncStorage.removeItem(STORAGE_KEY).catch((err) => {
        console.warn('Failed to clear user profile:', err)
      })
    },

    async restoreFromStorage() {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY)
        if (data) {
          const user = JSON.parse(data) as AuthUser
          set({ user, status: 'ready' })
        } else {
          set({ status: 'idle' })
        }
      } catch (err) {
        console.warn('Failed to restore user profile:', err)
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
