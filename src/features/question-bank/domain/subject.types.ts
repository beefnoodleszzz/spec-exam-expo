export interface SubjectProgress {
  answered: number
  correct: number
  total: number
}

export interface Subject {
  id: string
  name: string
  questionCount: number | null
  progress: SubjectProgress | null
}
