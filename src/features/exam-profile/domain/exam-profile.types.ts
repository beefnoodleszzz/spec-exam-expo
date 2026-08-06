export interface ExamProfile {
  examTypeId: string
  examTypeName: string

  province: string | null
  provinceCode: string | null

  inviteCode: string | null
}

export interface ExamTypeOption {
  id: string
  name: string
  provinceRequired: boolean
}
