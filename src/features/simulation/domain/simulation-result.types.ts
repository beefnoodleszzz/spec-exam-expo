export interface SimulationQuestionResult {
  questionId: string
  userAnswers: string[]
  isCorrect: boolean
  score: number
}

export interface SimulationResult {
  paperId: string
  score: number
  totalScore: number | null
  correctCount: number
  wrongCount: number
  unansweredCount: number
  passed: boolean | null
  durationSeconds: number
  questionResults: SimulationQuestionResult[]
}

