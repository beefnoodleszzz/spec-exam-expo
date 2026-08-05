/**
 * App Store — Zustand store for non-auth client-side global state.
 *
 * Single source of truth for:
 * - Current exam profile summary (drives request headers)
 * - Theme mode
 */
import { create } from 'zustand'
import {
  getAsync,
  setAsync,
  removeAsync,
  AsyncKeys,
} from '@/shared/persistence/async-storage'

export type ThemeMode = 'light' | 'dark'

export interface ExamProfileSummary {
  examTypeId: string
  examTypeName: string
  regionId?: string
  regionName?: string
  subjectId?: string
  subjectName?: string
}

export interface AppState {
  currentExamProfile: ExamProfileSummary | null
  themeMode: ThemeMode

  setExamProfile: (profile: ExamProfileSummary) => Promise<void>
  clearExamProfileMemory: () => void
  clearPersistedExamProfile: () => Promise<void>
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

  clearExamProfileMemory: () => {
    set({ currentExamProfile: null })
  },

  clearPersistedExamProfile: async () => {
    await removeAsync(AsyncKeys.EXAM_PROFILE_SUMMARY)
  },

  clearExamProfile: async () => {
    set({ currentExamProfile: null })
    await removeAsync(AsyncKeys.EXAM_PROFILE_SUMMARY)
  },

  restoreExamProfile: async () => {
    const profile = await getAsync<ExamProfileSummary>(AsyncKeys.EXAM_PROFILE_SUMMARY)
    if (profile) {
      set({ currentExamProfile: profile })
    }
  },

  setThemeMode: (mode) => {
    set({ themeMode: mode })
  },
}))
