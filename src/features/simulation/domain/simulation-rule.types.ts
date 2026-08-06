export interface SimulationRule {
  examTypeId: string
  durationSeconds: number
  totalQuestions: number
  totalScore: number | null
  passScore: number | null
}
