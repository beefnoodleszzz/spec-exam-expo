export type QuestionType = 'single' | 'multiple' | 'judge' | 'unknown'

export interface QuestionOption {
  id: string
  label: string
  content: string
}

export interface Question {
  id: string
  type: QuestionType
  stemHtml: string
  options: QuestionOption[]

  correctAnswers: string[]
  explanationHtml: string | null

  isFavorite: boolean
  userAnswers: string[]
}
