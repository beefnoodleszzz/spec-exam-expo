import type { ExamProfile, ExamTypeOption } from '../domain/exam-profile.types'

export interface ExamProfileRemote {
  listExamTypes(signal?: AbortSignal): Promise<ExamTypeOption[]>
  registerExamProfile(profile: ExamProfile, signal?: AbortSignal): Promise<void>
}
