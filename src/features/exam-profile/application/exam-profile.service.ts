import { appStore } from '@/shared/auth/app-store'
import { queryClient } from '@/shared/query/query-client'
import { examProfileRemote } from '../data/exam-profile.remote.impl'
import type { ExamProfile, ExamTypeOption } from '../domain/exam-profile.types'

export interface ExamProfileService {
  listExamTypes(signal?: AbortSignal): Promise<ExamTypeOption[]>
  selectExamProfile(profile: ExamProfile, signal?: AbortSignal): Promise<void>
  switchExamProfile(profile: ExamProfile, signal?: AbortSignal): Promise<void>
  clearExamProfile(): Promise<void>
}

export class ExamProfileServiceImpl implements ExamProfileService {
  async listExamTypes(signal?: AbortSignal): Promise<ExamTypeOption[]> {
    return examProfileRemote.listExamTypes(signal)
  }

  async selectExamProfile(profile: ExamProfile, signal?: AbortSignal): Promise<void> {
    await examProfileRemote.registerExamProfile(profile, signal)
    await appStore.getState().setExamProfile(profile)
  }

  async switchExamProfile(profile: ExamProfile, signal?: AbortSignal): Promise<void> {
    const currentProfile = appStore.getState().currentExamProfile
    const oldExamTypeId = currentProfile?.examTypeId

    if (oldExamTypeId === profile.examTypeId) {
      return
    }

    await examProfileRemote.registerExamProfile(profile, signal)
    await appStore.getState().setExamProfile(profile)

    if (oldExamTypeId) {
      // Clear queries associated with the old exam type
      queryClient.removeQueries({
        predicate: (query) => {
          const queryKey = query.queryKey as unknown[]
          return queryKey.includes(oldExamTypeId)
        },
      })
    }
  }

  async clearExamProfile(): Promise<void> {
    const currentProfile = appStore.getState().currentExamProfile
    const oldExamTypeId = currentProfile?.examTypeId

    await appStore.getState().clearExamProfile()

    if (oldExamTypeId) {
      queryClient.removeQueries({
        predicate: (query) => {
          const queryKey = query.queryKey as unknown[]
          return queryKey.includes(oldExamTypeId)
        },
      })
    }
  }
}

export const examProfileService = new ExamProfileServiceImpl()
