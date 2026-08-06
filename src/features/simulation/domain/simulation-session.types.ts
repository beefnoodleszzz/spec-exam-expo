export interface SimulationAnswer {
  answers: string[]
  marked: boolean
  updatedAt: string
}

export interface SimulationSession {
  paperId: string
  examTypeId: string
  questionIds: string[]
  currentIndex: number
  answers: Record<string, SimulationAnswer>

  startedAt: string
  expiresAt: string
  status: 'active' | 'submitting' | 'submitted' | 'expired'
}
