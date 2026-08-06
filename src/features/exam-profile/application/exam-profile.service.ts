import { appStore } from '@/shared/auth/app-store'
import { queryClient } from '@/shared/query/query-client'
import { examProfileRemote } from '../data/exam-profile.remote.impl'
import type { ExamProfile, ExamTypeOption } from '../domain/exam-profile.types'
import { examScopedQueryKeys } from '@/shared/query/exam-scoped-query-keys'

function isSameExamProfile(
  left: ExamProfile | null,
  right: ExamProfile,
): boolean {
  return (
    left?.examTypeId === right.examTypeId &&
    left?.province === right.province &&
    left?.provinceCode === right.provinceCode &&
    left?.inviteCode === right.inviteCode
  )
}

async function removeExamScopedQueries(
  examTypeId: string,
): Promise<void> {
  await Promise.all([
    queryClient.removeQueries({
      queryKey: examScopedQueryKeys.home(examTypeId),
    }),
    queryClient.removeQueries({
      queryKey: examScopedQueryKeys.subjects(examTypeId),
    }),
    queryClient.removeQueries({
      queryKey: examScopedQueryKeys.practiceRoot(examTypeId),
    }),
  ])
}

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

    if (isSameExamProfile(currentProfile, profile)) {
      return
    }

    await examProfileRemote.registerExamProfile(profile, signal)
    await appStore.getState().setExamProfile(profile)

    const oldExamTypeId = currentProfile?.examTypeId

    if (oldExamTypeId) {
      await removeExamScopedQueries(oldExamTypeId)
    }
  }

  async clearExamProfile(): Promise<void> {
    const currentProfile = appStore.getState().currentExamProfile
    const oldExamTypeId = currentProfile?.examTypeId

    await appStore.getState().clearExamProfile()

    if (oldExamTypeId) {
      await removeExamScopedQueries(oldExamTypeId)
    }
  }
}

export const examProfileService = new ExamProfileServiceImpl()
