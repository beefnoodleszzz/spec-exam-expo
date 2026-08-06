import { questionBankRemote } from '../data/question-bank.remote.impl'
import type { PracticeSessionSeed } from '../data/question-bank.remote'
import type { PracticeSessionState } from '../state/practice-session.store';
import { usePracticeSessionStore } from '../state/practice-session.store'
import type { PracticeMode } from '../domain/practice.types'

export interface CreatePracticeInput {
  examTypeId: string
  subjectId: string
  chapterId?: string
  mode: PracticeMode
}

export class PracticeService {
  private answerSubmissions = new Map<string, Promise<void>>()
  private favoriteMutations = new Map<string, Promise<void>>()

  async startPractice(input: CreatePracticeInput): Promise<void> {
    if (!input.examTypeId) throw new Error('Missing examTypeId')

    let seed: PracticeSessionSeed
    if (input.mode === 'order') {
      seed = await questionBankRemote.createOrderPractice(input.examTypeId, input.subjectId, input.chapterId)
    } else if (input.mode === 'random') {
      seed = await questionBankRemote.createRandomPractice(input.examTypeId, input.subjectId)
    } else if (input.mode === 'wrong') {
      seed = await questionBankRemote.listWrongQuestions(input.examTypeId, input.subjectId)
    } else {
      seed = await questionBankRemote.listFavoriteQuestions(input.examTypeId, input.subjectId)
    }
    
    if (seed.questionIds.length === 0) {
      throw new Error('当前题库没有题目')
    }

    const session: PracticeSessionState = {
      examTypeId: input.examTypeId,
      subjectId: input.subjectId,
      ...(input.chapterId ? { chapterId: input.chapterId } : {}),
      mode: input.mode,
      questionIds: seed.questionIds,
      currentIndex: 0,
      answers: {},
      currentQuestionStartedAt: Date.now()
    }

    usePracticeSessionStore.getState().actions.startSession(session)
    await this.ensureQuestionLoaded(session.questionIds[0]!)
  }

  async ensureQuestionLoaded(questionId: string): Promise<void> {
    const store = usePracticeSessionStore.getState()
    if (store.questionsCache[questionId]) return

    try {
      store.actions.setLoadingQuestion(true)
      const question = await questionBankRemote.getQuestion(questionId)
      
      const existingAnswer = store.currentSession?.answers[questionId]
      if (existingAnswer) {
        question.userAnswers = existingAnswer.answers
      }

      store.actions.cacheQuestion(question)
    } catch {
      store.actions.removeInvalidQuestion(questionId)
      
      const session = store.currentSession
      if (session && session.questionIds.length === 0) {
        store.actions.clearSession()
      }
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
    if (this.answerSubmissions.has(questionId)) {
      return this.answerSubmissions.get(questionId)!
    }

    const promise = this.doSubmitAnswer(questionId, answers)
    this.answerSubmissions.set(questionId, promise)
    
    try {
      await promise
    } finally {
      this.answerSubmissions.delete(questionId)
    }
  }

  private async doSubmitAnswer(questionId: string, answers: string[]): Promise<void> {
    const store = usePracticeSessionStore.getState()
    const session = store.currentSession
    if (!session) return

    store.actions.submitAnswer(questionId, answers, 'pending')
    
    const q = store.questionsCache[questionId]
    if (q) {
      q.userAnswers = answers
      store.actions.cacheQuestion({ ...q })
    }

    const elapsedSeconds = Math.max(1, Math.floor((Date.now() - session.currentQuestionStartedAt) / 1000))

    try {
      const isMistakeOpt = q ? (
        q.correctAnswers.length !== answers.length || 
        !q.correctAnswers.every(a => answers.includes(a))
      ) : false

      const result = await questionBankRemote.submitExerciseRecord({
        questionId,
        answers,
        elapsedSeconds,
        isMistake: isMistakeOpt,
        isFavorite: q?.isFavorite ?? false
      })

      const finalCorrectAnswers = result.correctAnswers.length > 0 
        ? result.correctAnswers 
        : (q?.correctAnswers ?? [])
        
      const finalExplanationHtml = result.explanationHtml 
        ?? (q?.explanationHtml ?? null)

      store.actions.markAnswerSynced({
        questionId,
        correct: result.correct,
        correctAnswers: finalCorrectAnswers,
        explanationHtml: finalExplanationHtml
      })

      if (q) {
        let needsUpdate = false
        if (q.correctAnswers.join(',') !== finalCorrectAnswers.join(',')) {
          q.correctAnswers = finalCorrectAnswers
          needsUpdate = true
        }
        if (q.explanationHtml !== finalExplanationHtml) {
          q.explanationHtml = finalExplanationHtml
          needsUpdate = true
        }
        
        if (needsUpdate) {
          store.actions.cacheQuestion({ ...q })
        }
      }
    } catch {
      store.actions.updateAnswerStatus(questionId, 'failed')
    }
  }

  async retryAnswer(questionId: string): Promise<void> {
    const store = usePracticeSessionStore.getState()
    const answerData = store.currentSession?.answers[questionId]
    if (answerData && answerData.status === 'failed') {
      await this.submitAnswer(questionId, answerData.answers)
    }
  }

  async toggleFavorite(questionId: string): Promise<void> {
    if (this.favoriteMutations.has(questionId)) {
      return this.favoriteMutations.get(questionId)!
    }

    const promise = this.doToggleFavorite(questionId)
    this.favoriteMutations.set(questionId, promise)
    
    try {
      await promise
    } finally {
      this.favoriteMutations.delete(questionId)
    }
  }

  private async doToggleFavorite(questionId: string): Promise<void> {
    const store = usePracticeSessionStore.getState()
    const question = store.questionsCache[questionId]
    if (!question) return

    const newFavorite = !question.isFavorite
    store.actions.updateQuestionFavorite(questionId, newFavorite)

    try {
      await questionBankRemote.toggleCollection(questionId, newFavorite)
    } catch (e) {
      store.actions.updateQuestionFavorite(questionId, !newFavorite)
      throw e
    }
  }

  async submitSession(): Promise<void> {
    usePracticeSessionStore.getState().actions.clearSession()
  }

  async resumeSession(): Promise<void> {
    const store = usePracticeSessionStore.getState()
    const session = store.currentSession
    if (!session) return

    // If examTypeId doesn't match the current appStore, clear it
    const { appStore } = await import('@/shared/auth/app-store')
    const currentExamProfile = appStore.getState().currentExamProfile
    if (!currentExamProfile || session.examTypeId !== currentExamProfile.examTypeId) {
      store.actions.clearSession()
      return
    }

    if (session.questionIds.length > 0) {
      const currentId = session.questionIds[session.currentIndex]
      if (currentId) {
        await this.ensureQuestionLoaded(currentId)
      } else {
        store.actions.clearSession()
      }
    } else {
      store.actions.clearSession()
    }
  }
}

export const practiceService = new PracticeService()
