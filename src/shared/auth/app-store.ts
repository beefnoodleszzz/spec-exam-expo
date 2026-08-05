/**
 * App Store — Zustand store for non-auth client-side global state.
 *
 * Stores only what cannot live in TanStack Query:
 * - Current exam profile summary (drives request headers)
 * - App variant
 * - Theme mode
 *
 * Rules:
 * - Do NOT store server data (user details, questions, scores, etc.)
 * - Do NOT store per-page loading or error state
 */
import { create } from 'zustand'
import type { AppVariantType } from '@/shared/config/app.config'
import {
  getAsync,
  setAsync,
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
  clearExamProfile: () => Promise<void>
  restoreExamProfile: () => Promise<void>
  setThemeMode: (mode: ThemeMode) => void
}

export const appStore = create<AppState>((set) => ({
  currentExamProfile: null,
  themeMode: 'light',

  setExamProfile: async (profile) => {
    await setAsync(AsyncKeys.EXAM_PROFILE_SUMMARY, profile)
    set({ currentExamProfile: profile })
  },

  clearExamProfile: async () => {
    await setAsync(AsyncKeys.EXAM_PROFILE_SUMMARY, null)
    set({ currentExamProfile: null })
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
