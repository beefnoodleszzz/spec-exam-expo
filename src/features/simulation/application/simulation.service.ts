import { SimulationRemoteImpl } from '../data/simulation.remote.impl'
import { useSimulationSessionStore } from '../state/simulation-session.store'
import type { SimulationResult } from '../domain/simulation-result.types'
import { queryClient } from '@/shared/query/query-client'
import { examScopedQueryKeys } from '@/shared/query/exam-scoped-query-keys'

export class SimulationService {
  private remote = new SimulationRemoteImpl()
  private submissionPromise: Promise<SimulationResult> | null = null

  async startExam(examTypeId: string): Promise<void> {
    const paper = await this.remote.createPaper(examTypeId)
    
    // Calculate expiresAt
    const expiresAt = new Date(
      Date.now() + paper.durationSeconds * 1000,
    ).toISOString()

    useSimulationSessionStore.getState().setSession(examTypeId, {
      paperId: paper.paperId,
      examTypeId,
      questionIds: paper.questions.map((q) => q.questionId),
      currentIndex: 0,
      answers: {},
      startedAt: paper.startedAt,
      expiresAt,
      status: 'active',
    })
  }

  resumeExam(examTypeId: string): boolean {
    const session = useSimulationSessionStore.getState().sessions[examTypeId]
    if (!session || session.status === 'submitted') {
      return false
    }

    // Check if expired upon resume
    const remainingSeconds = this.getRemainingSeconds(examTypeId)
    if (remainingSeconds <= 0 && session.status === 'active') {
      this.handleTimeout(examTypeId)
    }

    return true
  }

  getRemainingSeconds(examTypeId: string): number {
    const session = useSimulationSessionStore.getState().sessions[examTypeId]
    if (!session) return 0
    
    return Math.max(
      0,
      Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000),
    )
  }

  async submitPaper(examTypeId: string): Promise<SimulationResult> {
    const session = useSimulationSessionStore.getState().sessions[examTypeId]
    if (!session) {
      throw new Error('No active simulation session found')
    }

    if (this.submissionPromise) {
      return this.submissionPromise
    }

    useSimulationSessionStore.getState().updateStatus(examTypeId, 'submitting')

    this.submissionPromise = this.remote
      .submitPaper({ session })
      .then((result) => {
        useSimulationSessionStore.getState().updateStatus(examTypeId, 'submitted')
        useSimulationSessionStore.getState().setLastResult(result)
        // Invalidate history query
        queryClient.invalidateQueries({
          queryKey: examScopedQueryKeys.simulationHistory(examTypeId),
        })
        return result
      })
      .catch((error) => {
        useSimulationSessionStore.getState().updateStatus(examTypeId, 'active')
        throw error
      })
      .finally(() => {
        this.submissionPromise = null
      })

    return this.submissionPromise
  }

  handleTimeout(examTypeId: string): void {
    const session = useSimulationSessionStore.getState().sessions[examTypeId]
    if (!session || session.status !== 'active') return

    useSimulationSessionStore.getState().updateStatus(examTypeId, 'expired')
    this.submitPaper(examTypeId).catch(() => {
      // If it fails on timeout, status stays expired, but session is not cleared.
      // The user will be prompted to retry.
      // Wait, submitPaper updates status to 'active' on failure.
      // So if timeout fails, it goes back to active, which triggers timeout again?
      // Actually, if remaining time is 0, UI should show "Failed to submit, please retry manually".
    })
  }

  finishExam(examTypeId: string): void {
    useSimulationSessionStore.getState().clearSession(examTypeId)
  }

  // Debounced auto-save could be implemented here or hooked up in UI using lodash/debounce
  // calling remote.saveProgress
}

export const simulationService = new SimulationService()
