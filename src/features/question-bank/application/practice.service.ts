import { questionBankRemote } from '../data/question-bank.remote.impl'
import type { CreatePracticeInput } from '../data/question-bank.remote'
import { usePracticeSessionStore } from '../state/practice-session.store'
import type { PracticeSession } from '../domain/practice.types'

export class PracticeService {
  async startPractice(input: CreatePracticeInput): Promise<void> {
    if (!input.examTypeId) throw new Error('Missing examTypeId')

    const seed = await questionBankRemote.createPractice(input)
    
    if (seed.questionIds.length === 0) {
      throw new Error('当前题库没有题目')
    }

    const session: PracticeSession = {
      sessionId: Date.now().toString(), // local id
      examTypeId: input.examTypeId,
      subjectId: input.subjectId,
      chapterId: input.chapterId,
      mode: input.mode,
      questionIds: seed.questionIds,
      currentIndex: 0,
      answers: {},
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    usePracticeSessionStore.getState().actions.startSession(session)
    
    // Auto load first question
    await this.ensureQuestionLoaded(session.questionIds[0]!)
  }

  async ensureQuestionLoaded(questionId: string): Promise<void> {
    const store = usePracticeSessionStore.getState()
    if (store.questionsCache[questionId]) return

    try {
      store.actions.setLoadingQuestion(true)
      const question = await questionBankRemote.getQuestion(questionId)
      
      // If we already have an answer recorded in the session, restore it to the question
      const existingAnswer = store.currentSession?.answers[questionId]
      if (existingAnswer) {
        question.userAnswers = existingAnswer
      }

      store.actions.cacheQuestion(question)
    } finally {
      store.actions.setLoadingQuestion(false)
    }
  }

  async loadNextQuestion(): Promise<void> {
    const store = usePracticeSessionStore.getState()
    const session = store.currentSession
    if (!session) return

    const nextIndex = session.currentIndex + 1
    if (nextIndex < session.questionIds.length) {
      const nextId = session.questionIds[nextIndex]!
      await this.ensureQuestionLoaded(nextId)
      store.actions.moveToIndex(nextIndex)
    }
  }

  async loadPrevQuestion(): Promise<void> {
    const store = usePracticeSessionStore.getState()
    const session = store.currentSession
    if (!session) return

    const prevIndex = session.currentIndex - 1
    if (prevIndex >= 0) {
      const prevId = session.questionIds[prevIndex]!
      await this.ensureQuestionLoaded(prevId)
      store.actions.moveToIndex(prevIndex)
    }
  }

  async moveToQuestion(index: number): Promise<void> {
    const store = usePracticeSessionStore.getState()
    const session = store.currentSession
    if (!session) return
    
    if (index >= 0 && index < session.questionIds.length) {
      const id = session.questionIds[index]!
      await this.ensureQuestionLoaded(id)
      store.actions.moveToIndex(index)
    }
  }

  async submitAnswer(questionId: string, answers: string[]): Promise<void> {
    const store = usePracticeSessionStore.getState()
    const session = store.currentSession
    if (!session) return

    // Immediately record locally
    store.actions.recordAnswer(questionId, answers)
    
    // Is it wrong?
    const q = store.questionsCache[questionId]
    const isMistake = q && (
      q.correctAnswers.length !== answers.length || 
      !q.correctAnswers.every(a => answers.includes(a))
    )

    // Sync to backend
    try {
      await questionBankRemote.submitAnswer({
        questionId,
        answers,
        elapsedSeconds: 5, // Ideally track real time per question
        practiceMode: session.mode,
        isMistake: isMistake ?? false,
        isFavorite: q?.isFavorite ?? false
      })
    } catch (e) {
      console.warn('Failed to sync answer to backend', e)
      // We don't rollback local state for offline resilience
    }
  }

  async toggleFavorite(questionId: string): Promise<void> {
    const store = usePracticeSessionStore.getState()
    const question = store.questionsCache[questionId]
    if (!question) return

    const newFavorite = !question.isFavorite
    
    // Optistic update
    store.actions.toggleFavorite(questionId, newFavorite)

    try {
      await questionBankRemote.toggleFavorite(questionId, newFavorite)
    } catch (e) {
      console.warn('Failed to toggle favorite', e)
      // Rollback
      store.actions.toggleFavorite(questionId, !newFavorite)
    }
  }

  async submitSession(): Promise<void> {
    // Legacy mapping submitted ALL answers upon leaving.
    // However, our new API syncs them as we go. We might just clear the session.
    usePracticeSessionStore.getState().actions.endSession()
  }
}

export const practiceService = new PracticeService()
