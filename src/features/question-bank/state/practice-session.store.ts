import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Question } from '../domain/question.types'
import type { PracticeMode } from '../domain/practice.types'

export type AnswerSyncStatus = 'pending' | 'synced' | 'failed'

export interface PracticeAnswer {
  answers: string[]
  status: AnswerSyncStatus
  updatedAt: string
  serverCorrect?: boolean | null
  correctAnswers?: string[]
  explanationHtml?: string | null
}

export interface PracticeSessionState {
  examTypeId: string
  subjectId: string
  chapterId?: string
  mode: PracticeMode
  
  questionIds: string[]
  currentIndex: number
  answers: Record<string, PracticeAnswer>
  draftAnswers: Record<string, string[]>
  
  currentQuestionStartedAt: number
}

interface PracticeSessionStore {
  currentSession: PracticeSessionState | null
  questionsCache: Record<string, Question>
  isLoadingQuestion: boolean
  
  actions: {
    startSession: (session: PracticeSessionState) => void
    moveToIndex: (index: number) => void
    cacheQuestion: (question: Question) => void
    setLoadingQuestion: (loading: boolean) => void
    submitAnswer: (questionId: string, answers: string[], status: AnswerSyncStatus) => void
    updateAnswerStatus: (questionId: string, status: AnswerSyncStatus) => void
    markAnswerSynced: (payload: { questionId: string, correct: boolean | null, correctAnswers: string[], explanationHtml: string | null }) => void
    clearSession: () => void
    removeInvalidQuestion: (questionId: string) => void
    updateQuestionFavorite: (questionId: string, isFavorite: boolean) => void
    setDraftAnswer: (questionId: string, answers: string[]) => void
  }
}

export const usePracticeSessionStore = create<PracticeSessionStore>()(
  persist(
    (set) => ({
      currentSession: null,
      questionsCache: {},
      isLoadingQuestion: false,

      actions: {
        startSession: (session) => set({ currentSession: session }),
        
        moveToIndex: (index) => set((state) => {
          if (!state.currentSession) return state
          return {
            currentSession: {
              ...state.currentSession,
              currentIndex: index,
              currentQuestionStartedAt: Date.now()
            }
          }
        }),

        cacheQuestion: (question) => set((state) => ({
          questionsCache: {
            ...state.questionsCache,
            [question.id]: question
          }
        })),

        setLoadingQuestion: (loading) => set({ isLoadingQuestion: loading }),

        submitAnswer: (questionId, answers, status) => set((state) => {
          if (!state.currentSession) return state
          return {
            currentSession: {
              ...state.currentSession,
              answers: {
                ...state.currentSession.answers,
                [questionId]: {
                  answers,
                  status,
                  updatedAt: new Date().toISOString()
                }
              }
            }
          }
        }),

        updateAnswerStatus: (questionId, status) => set((state) => {
          if (!state.currentSession) return state
          const existing = state.currentSession.answers[questionId]
          if (!existing) return state
          return {
            currentSession: {
              ...state.currentSession,
              answers: {
                ...state.currentSession.answers,
                [questionId]: {
                  ...existing,
                  status,
                  updatedAt: new Date().toISOString()
                }
              }
            }
          }
        }),

        markAnswerSynced: ({ questionId, correct, correctAnswers, explanationHtml }) => set((state) => {
          if (!state.currentSession || !state.currentSession.answers[questionId]) return state
          return {
            currentSession: {
              ...state.currentSession,
              answers: {
                ...state.currentSession.answers,
                [questionId]: {
                  ...state.currentSession.answers[questionId],
                  status: 'synced',
                  serverCorrect: correct,
                  correctAnswers,
                  explanationHtml,
                  updatedAt: new Date().toISOString()
                }
              }
            }
          }
        }),

        clearSession: () => set({ currentSession: null, questionsCache: {} }),

        removeInvalidQuestion: (questionId) => set((state) => {
          if (!state.currentSession) return state
          const newIds = state.currentSession.questionIds.filter(id => id !== questionId)
          let newIndex = state.currentSession.currentIndex
          if (newIndex >= newIds.length) {
            newIndex = Math.max(0, newIds.length - 1)
          }
          return {
            currentSession: {
              ...state.currentSession,
              questionIds: newIds,
              currentIndex: newIndex
            }
          }
        }),

        updateQuestionFavorite: (questionId, isFavorite) => set((state) => {
          const q = state.questionsCache[questionId]
          if (!q) return state
          return {
            questionsCache: {
              ...state.questionsCache,
              [questionId]: {
                ...q,
                isFavorite
              }
            }
          }
        }),

        setDraftAnswer: (questionId, answers) => set((state) => {
          if (!state.currentSession) return state
          return {
            currentSession: {
              ...state.currentSession,
              draftAnswers: {
                ...state.currentSession.draftAnswers,
                [questionId]: answers
              }
            }
          }
        }),
      }
    }),
    {
      name: 'practice-session-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ currentSession: state.currentSession }),
    }
  )
)
