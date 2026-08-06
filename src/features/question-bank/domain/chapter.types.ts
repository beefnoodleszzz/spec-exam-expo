export interface Chapter {
  id: string
  subjectId: string
  name: string
  questionCount: number
  answeredCount: number
  children: Chapter[]
}
