export interface SimulationAnswer {
  answers: string[]
  marked: boolean
  updatedAt: string
}

export type SimulationStatus =
  | 'active'
  | 'submitting'
  | 'submitted'
  | 'expired'
  | 'submit_failed'

export interface SimulationSession {
  paperId: string
  examTypeId: string
  questionIds: string[]
  currentIndex: number
  answers: Record<string, SimulationAnswer>

  startedAt: string
  expiresAt: string
  status: SimulationStatus
}
