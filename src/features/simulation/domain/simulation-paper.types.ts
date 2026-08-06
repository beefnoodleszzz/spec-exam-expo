export interface SimulationQuestionRef {
  questionId: string
  subjectId: string | null
  score: number | null
  order: number
}

export interface SimulationPaper {
  paperId: string
  title: string
  durationSeconds: number
  questions: SimulationQuestionRef[]
  startedAt: string
  expiresAt: string | null
}
