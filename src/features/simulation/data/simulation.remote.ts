import type { SimulationRule } from '../domain/simulation-rule.types'
import type { SimulationPaper } from '../domain/simulation-paper.types'
import type { SimulationResult } from '../domain/simulation-result.types'
import type { SimulationHistoryItem } from '../domain/simulation-history.types'
import type { SimulationSession } from '../domain/simulation-session.types'

export interface SaveSimulationProgressInput {
  session: SimulationSession
}

export interface SubmitSimulationPaperInput {
  session: SimulationSession
}

export interface SimulationRemote {
  getRule(
    examTypeId: string,
    signal?: AbortSignal,
  ): Promise<SimulationRule>

  createPaper(
    examTypeId: string,
    signal?: AbortSignal,
  ): Promise<SimulationPaper>

  getPaper(
    paperId: string,
    signal?: AbortSignal,
  ): Promise<SimulationPaper>

  saveProgress(
    input: SaveSimulationProgressInput,
    signal?: AbortSignal,
  ): Promise<void>

  submitPaper(
    input: SubmitSimulationPaperInput,
    signal?: AbortSignal,
  ): Promise<SimulationResult>

  getResult(
    paperId: string,
    signal?: AbortSignal,
  ): Promise<SimulationResult>

  listHistory(
    examTypeId: string,
    signal?: AbortSignal,
  ): Promise<SimulationHistoryItem[]>
}
