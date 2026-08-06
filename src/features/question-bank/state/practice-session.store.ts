import { create } from 'zustand'
import type { PracticeSession } from '../domain/practice.types'
import type { Question } from '../domain/question.types'

interface PracticeSessionState {
  currentSession: PracticeSession | null
  questionsCache: Record<string, Question>
  isLoadingQuestion: boolean

  actions: {
    startSession: (session: PracticeSession) => void
    endSession: () => void
    setLoadingQuestion: (loading: boolean) => void
    cacheQuestion: (question: Question) => void
    
    // Updates
    moveToIndex: (index: number) => void
    recordAnswer: (questionId: string, answers: string[]) => void
    toggleFavorite: (questionId: string, favorite: boolean) => void
  }
}

export const usePracticeSessionStore = create<PracticeSessionState>((set) => ({
  currentSession: null,
  questionsCache: {},
  isLoadingQuestion: false,

  actions: {
    startSession: (session) => {
      set({ currentSession: session, questionsCache: {}, isLoadingQuestion: false })
    },
    endSession: () => {
      set({ currentSession: null, questionsCache: {}, isLoadingQuestion: false })
    },
    setLoadingQuestion: (loading) => {
      set({ isLoadingQuestion: loading })
    },
    cacheQuestion: (question) => {
      set((state) => ({
        questionsCache: {
          ...state.questionsCache,
          [question.id]: question,
        },
      }))
    },
    moveToIndex: (index) => {
      set((state) => {
        if (!state.currentSession) return state
        const maxIndex = state.currentSession.questionIds.length - 1
        return {
          currentSession: {
            ...state.currentSession,
            currentIndex: Math.max(0, Math.min(index, maxIndex)),
            updatedAt: new Date().toISOString(),
          },
        }
      })
    },
    recordAnswer: (questionId, answers) => {
      set((state) => {
        if (!state.currentSession) return state
        
        // Also update the cached question's userAnswers for direct component reading
        const currentQuestion = state.questionsCache[questionId]
        const nextCache = { ...state.questionsCache }
        if (currentQuestion) {
          nextCache[questionId] = {
            ...currentQuestion,
            userAnswers: answers,
          }
        }

        return {
          currentSession: {
            ...state.currentSession,
            answers: {
              ...state.currentSession.answers,
              [questionId]: answers,
            },
            updatedAt: new Date().toISOString(),
          },
          questionsCache: nextCache,
        }
      })
    },
    toggleFavorite: (questionId, favorite) => {
      set((state) => {
        const currentQuestion = state.questionsCache[questionId]
        if (!currentQuestion) return state

        return {
          questionsCache: {
            ...state.questionsCache,
            [questionId]: {
              ...currentQuestion,
              isFavorite: favorite,
            },
          },
        }
      })
    },
  },
}))
