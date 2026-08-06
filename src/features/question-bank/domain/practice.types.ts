export type PracticeMode = 'order' | 'random' | 'wrong' | 'favorite'

export interface PracticeSession {
  sessionId: string
  examTypeId: string
  subjectId: string
  chapterId: string | null
  mode: PracticeMode

  questionIds: string[]
  currentIndex: number
  answers: Record<string, string[]>

  startedAt: string
  updatedAt: string
}
