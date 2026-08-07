import { describe, it, expect, beforeEach, vi } from 'vitest'
import { appStore } from '../shared/auth/app-store'
import { queryClient } from '../shared/query/query-client'
import { resetGlobalState } from '../testing/reset-global-state'
import { examProfileService } from '../features/exam-profile/application/exam-profile.service'
import { examScopedQueryKeys } from '../shared/query/exam-scoped-query-keys'

vi.mock('../features/exam-profile/data/exam-profile.remote.impl', () => ({
  examProfileRemote: {
    registerExamProfile: vi.fn().mockResolvedValue(undefined),
  }
}))

vi.mock('../shared/persistence/async-storage', () => ({
  setAsync: vi.fn(),
  removeAsync: vi.fn(),
  getAsync: vi.fn(),
  AsyncKeys: { EXAM_PROFILE_SUMMARY: 'EXAM_PROFILE_SUMMARY' }
}))

describe('Exam Profile Switch Integration', () => {
  beforeEach(() => {
    resetGlobalState()
    vi.clearAllMocks()
  })

  it('should drop correct queries but keep non-exam-scoped data on switch', async () => {
    appStore.setState({ 
      currentExamProfile: { examTypeId: 'old', province: '', provinceCode: '', inviteCode: '', examTypeName: 'old' } 
    })

    queryClient.setQueryData(examScopedQueryKeys.home('old'), { data: 1 })
    queryClient.setQueryData(examScopedQueryKeys.subjects('old'), { data: 2 })
    queryClient.setQueryData(['purchaseHistory'], { data: 3 })
    
    await examProfileService.switchExamProfile({
      examTypeId: 'new', province: '', provinceCode: '', inviteCode: '', examTypeName: 'new'
    })

    expect(queryClient.getQueryData(examScopedQueryKeys.home('old'))).toBeUndefined()
    expect(queryClient.getQueryData(examScopedQueryKeys.subjects('old'))).toBeUndefined()
    expect(queryClient.getQueryData(['purchaseHistory'])).toEqual({ data: 3 })
  })
})
