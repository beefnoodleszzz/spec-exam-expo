import { SimulationRemoteImpl } from '../data/simulation.remote.impl'
import { useSimulationSessionStore } from '../state/simulation-session.store'
import type { SimulationResult } from '../domain/simulation-result.types'
import { queryClient } from '@/shared/query/query-client'
import { examScopedQueryKeys } from '@/shared/query/exam-scoped-query-keys'

export class SimulationService {
  private remote = new SimulationRemoteImpl()
  private submissionPromises = new Map<string, Promise<SimulationResult>>()
  constructor() {
  }

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

  async submitPaper(
    examTypeId: string,
    reason: 'manual' | 'timeout' = 'manual'
  ): Promise<SimulationResult> {
    const session = useSimulationSessionStore.getState().sessions[examTypeId]
    if (!session) {
      throw new Error('No active simulation session found')
    }

    if (this.submissionPromises.has(examTypeId)) {
      return this.submissionPromises.get(examTypeId)!
    }

    useSimulationSessionStore.getState().updateStatus(examTypeId, 'submitting')

    const submissionPromise = this.remote
      .submitPaper({ session })
      .then((result) => {
        useSimulationSessionStore.getState().updateStatus(examTypeId, 'submitted')
        useSimulationSessionStore.getState().setLastResult(result)
        queryClient.invalidateQueries({
          queryKey: examScopedQueryKeys.simulationHistory(examTypeId),
        })
        return result
      })
      .catch((error) => {
        const hasExpired =
          Date.parse(session.expiresAt) <= Date.now()
        const fallbackStatus =
          hasExpired || reason === 'timeout' ? 'submit_failed' : 'active'
        useSimulationSessionStore.getState().updateStatus(examTypeId, fallbackStatus)
        throw error
      })
      .finally(() => {
        this.submissionPromises.delete(examTypeId)
      })

    this.submissionPromises.set(examTypeId, submissionPromise)
    return submissionPromise
  }

  handleTimeout(examTypeId: string): void {
    const session = useSimulationSessionStore.getState().sessions[examTypeId]
    if (!session || session.status !== 'active') return

    useSimulationSessionStore.getState().updateStatus(examTypeId, 'expired')
    this.submitPaper(examTypeId, 'timeout').catch(() => {
      // Failed timeout submissions naturally fall into 'submit_failed' status.
    })
  }

  finishExam(examTypeId: string): void {
    useSimulationSessionStore.getState().clearSession(examTypeId)
  }
}

export const simulationService = new SimulationService()
