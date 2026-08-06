import { describe, it, expect, vi, beforeEach } from 'vitest'
import { examProfileService } from '../exam-profile.service'
import { appStore } from '@/shared/auth/app-store'
import { queryClient } from '@/shared/query/query-client'
import { examProfileRemote } from '../../data/exam-profile.remote.impl'
import { examScopedQueryKeys } from '@/shared/query/exam-scoped-query-keys'

vi.mock('../../data/exam-profile.remote.impl', () => ({
  examProfileRemote: {
    registerExamProfile: vi.fn(),
  },
}))

vi.mock('@/shared/query/query-client', () => ({
  queryClient: {
    removeQueries: vi.fn(),
  },
}))

describe('examProfile.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    appStore.setState({ currentExamProfile: null })
  })

  it('selectExamProfile registers and sets store', async () => {
    await examProfileService.selectExamProfile({ examTypeId: '1', examTypeName: 'T', province: null, provinceCode: null, inviteCode: null })
    expect(examProfileRemote.registerExamProfile).toHaveBeenCalled()
    expect(appStore.getState().currentExamProfile?.examTypeId).toBe('1')
  })

  it('switchExamProfile updates profile when ID is the same but province changes', async () => {
    appStore.setState({ currentExamProfile: { examTypeId: '1', examTypeName: 'T', province: null, provinceCode: null, inviteCode: null } })
    await examProfileService.switchExamProfile({ examTypeId: '1', examTypeName: 'T', province: 'GD', provinceCode: null, inviteCode: null })
    expect(examProfileRemote.registerExamProfile).toHaveBeenCalled()
    expect(appStore.getState().currentExamProfile?.province).toBe('GD')
    expect(queryClient.removeQueries).not.toHaveBeenCalled()
  })

  it('switchExamProfile clears exact scoped query keys when ID changes', async () => {
    appStore.setState({ currentExamProfile: { examTypeId: '1', examTypeName: 'T1', province: null, provinceCode: null, inviteCode: null } })
    await examProfileService.switchExamProfile({ examTypeId: '2', examTypeName: 'T2', province: null, provinceCode: null, inviteCode: null })
    
    expect(queryClient.removeQueries).toHaveBeenCalledWith({
      queryKey: examScopedQueryKeys.home('1'),
    })
    expect(queryClient.removeQueries).toHaveBeenCalledWith({
      queryKey: examScopedQueryKeys.subjects('1'),
    })
    expect(queryClient.removeQueries).toHaveBeenCalledWith({
      queryKey: examScopedQueryKeys.practiceRoot('1'),
    })
    expect(appStore.getState().currentExamProfile?.examTypeId).toBe('2')
  })

  it('switchExamProfile does not update when profile is completely identical', async () => {
    const profile = { examTypeId: '1', examTypeName: 'T1', province: 'GD', provinceCode: null, inviteCode: null }
    appStore.setState({ currentExamProfile: profile })
    await examProfileService.switchExamProfile({ ...profile })
    
    expect(examProfileRemote.registerExamProfile).not.toHaveBeenCalled()
  })

  it('clearExamProfile removes profile and queries', async () => {
    appStore.setState({ currentExamProfile: { examTypeId: '1', examTypeName: 'T1', province: null, provinceCode: null, inviteCode: null } })
    await examProfileService.clearExamProfile()
    
    expect(appStore.getState().currentExamProfile).toBeNull()
    expect(queryClient.removeQueries).toHaveBeenCalledWith({
      queryKey: examScopedQueryKeys.home('1'),
    })
  })
})
