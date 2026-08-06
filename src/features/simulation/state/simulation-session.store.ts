import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { SimulationSession } from '../domain/simulation-session.types'
import type { SimulationResult } from '../domain/simulation-result.types'

export interface SimulationSessionState {
  sessions: Record<string, SimulationSession>
  lastResult: SimulationResult | null
}

export interface SimulationSessionActions {
  setSession(examTypeId: string, session: SimulationSession): void
  updateAnswer(
    examTypeId: string,
    questionId: string,
    answers: string[],
  ): void
  toggleMark(examTypeId: string, questionId: string): void
  updateCurrentIndex(examTypeId: string, index: number): void
  updateStatus(
    examTypeId: string,
    status: SimulationSession['status'],
  ): void
  clearSession(examTypeId: string): void
  clearAllSessions(): void
  setLastResult(result: SimulationResult | null): void
}

export type SimulationSessionStore = SimulationSessionState &
  SimulationSessionActions

export const useSimulationSessionStore = create<SimulationSessionStore>()(
  persist(
    (set) => ({
      sessions: {},
      lastResult: null,

      setSession: (examTypeId, session) =>
        set((state) => ({
          sessions: {
            ...state.sessions,
            [examTypeId]: session,
          },
        })),

      updateAnswer: (examTypeId, questionId, answers) =>
        set((state) => {
          const session = state.sessions[examTypeId]
          if (!session || session.status !== 'active') return state

          return {
            sessions: {
              ...state.sessions,
              [examTypeId]: {
                ...session,
                answers: {
                  ...session.answers,
                  [questionId]: {
                    answers,
                    marked:
                      session.answers[questionId]?.marked ?? false,
                    updatedAt: new Date().toISOString(),
                  },
                },
              },
            },
          }
        }),

      toggleMark: (examTypeId, questionId) =>
        set((state) => {
          const session = state.sessions[examTypeId]
          if (!session || session.status !== 'active') return state

          const currentAnswer = session.answers[questionId] || {
            answers: [],
            marked: false,
            updatedAt: new Date().toISOString(),
          }

          return {
            sessions: {
              ...state.sessions,
              [examTypeId]: {
                ...session,
                answers: {
                  ...session.answers,
                  [questionId]: {
                    ...currentAnswer,
                    marked: !currentAnswer.marked,
                    updatedAt: new Date().toISOString(),
                  },
                },
              },
            },
          }
        }),

      updateCurrentIndex: (examTypeId, index) =>
        set((state) => {
          const session = state.sessions[examTypeId]
          if (!session) return state

          return {
            sessions: {
              ...state.sessions,
              [examTypeId]: {
                ...session,
                currentIndex: index,
              },
            },
          }
        }),

      updateStatus: (examTypeId, status) =>
        set((state) => {
          const session = state.sessions[examTypeId]
          if (!session) return state

          return {
            sessions: {
              ...state.sessions,
              [examTypeId]: {
                ...session,
                status,
              },
            },
          }
        }),

      clearSession: (examTypeId) =>
        set((state) => {
          const newSessions = { ...state.sessions }
          delete newSessions[examTypeId]
          return { sessions: newSessions }
        }),

      clearAllSessions: () => set({ sessions: {} }),

      setLastResult: (result) => set({ lastResult: result }),
    }),
    {
      name: 'simulation-sessions-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
)
