/**
 * App Store — Zustand store for non-auth client-side global state.
 *
 * Single source of truth for:
 * - Current exam profile summary (drives request headers)
 * - Theme mode
 */
import { create } from 'zustand'
import type { ExamProfile } from '@/features/exam-profile/domain/exam-profile.types'
import {
  getAsync,
  setAsync,
  removeAsync,
  AsyncKeys,
} from '@/shared/persistence/async-storage'
export type { ExamProfile }

export type ThemeMode = 'light' | 'dark'


export interface AppState {
  currentExamProfile: ExamProfile | null
  themeMode: ThemeMode

  setExamProfile: (profile: ExamProfile) => Promise<void>
  resetExamProfileState: () => void
  removePersistedExamProfile: () => Promise<void>
  clearExamProfile: () => Promise<void>
  restoreExamProfile: () => Promise<void>
  setThemeMode: (mode: ThemeMode) => void
}

export const appStore = create<AppState>((set) => ({
  currentExamProfile: null,
  themeMode: 'light',

  setExamProfile: async (profile) => {
    set({ currentExamProfile: profile })
    await setAsync(AsyncKeys.EXAM_PROFILE_SUMMARY, profile)
  },

  resetExamProfileState: () => {
    set({ currentExamProfile: null })
  },

  removePersistedExamProfile: async () => {
    await removeAsync(AsyncKeys.EXAM_PROFILE_SUMMARY)
  },

  clearExamProfile: async () => {
    set({ currentExamProfile: null })
    await removeAsync(AsyncKeys.EXAM_PROFILE_SUMMARY)
  },

  restoreExamProfile: async () => {
    const profile = await getAsync<ExamProfile>(AsyncKeys.EXAM_PROFILE_SUMMARY)
    if (profile) {
      set({ currentExamProfile: profile })
    }
  },

  setThemeMode: (mode) => {
    set({ themeMode: mode })
  },
}))
