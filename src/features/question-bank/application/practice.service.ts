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
      draftAnswers: {},
      currentQuestionStartedAt: Date.now()
    }

    usePracticeSessionStore.getState().actions.startSession(session)
    await this.ensureQuestionLoaded(session.questionIds[0]!)
  }

  async ensureQuestionLoaded(questionId: string): Promise<boolean> {
    const store = usePracticeSessionStore.getState()
    if (store.questionsCache[questionId]) return true

    try {
      store.actions.setLoadingQuestion(true)
      const question = await questionBankRemote.getQuestion(questionId)
      
      const existingAnswer = store.currentSession?.answers[questionId]
      if (existingAnswer) {
        question.userAnswers = existingAnswer.answers
      }

      store.actions.cacheQuestion(question)
      return true
    } catch {
      store.actions.removeInvalidQuestion(questionId)
      
      const session = store.currentSession
      if (session && session.questionIds.length === 0) {
        store.actions.clearSession()
      }
      return false
    } finally {
      store.actions.setLoadingQuestion(false)
    }
  }

  private async loadValidQuestion(preferredIndex: number, direction: 1 | -1): Promise<boolean> {
    let store = usePracticeSessionStore.getState()
    let session = store.currentSession
    if (!session) return false

    let currentIndex = preferredIndex

    while (currentIndex >= 0 && currentIndex < session.questionIds.length) {
      const id = session.questionIds[currentIndex]!
      const loaded = await this.ensureQuestionLoaded(id)
      
      if (loaded) {
        store.actions.moveToIndex(currentIndex)
        return true
      }
      
      store = usePracticeSessionStore.getState()
      session = store.currentSession
      if (!session) return false

      if (direction === 1) {
        // Since ensureQuestionLoaded removes invalid questions, the next question takes the same index
      } else {
        currentIndex--
      }
    }
    return false
  }

  async loadNextQuestion(): Promise<void> {
    const session = usePracticeSessionStore.getState().currentSession
    if (!session) return
    await this.loadValidQuestion(session.currentIndex + 1, 1)
  }

  async loadPrevQuestion(): Promise<void> {
    const session = usePracticeSessionStore.getState().currentSession
    if (!session) return
    await this.loadValidQuestion(session.currentIndex - 1, -1)
  }

  async moveToQuestion(index: number): Promise<void> {
    await this.loadValidQuestion(index, 1)
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
      const valid = await this.loadValidQuestion(session.currentIndex, 1)
      if (!valid) {
        store.actions.clearSession()
      }
    } else {
      store.actions.clearSession()
    }
  }
}

export const practiceService = new PracticeService()
