export interface SimulationHistoryItem {
  resultId: string
  paperId: string
  title: string
  score: number
  passScore: number | null
  passed: boolean | null
  durationSeconds: number
  createdAt: string
}
