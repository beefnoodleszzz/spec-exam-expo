import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { examProfileRemote } from '../exam-profile.remote.impl'
import {
  apiExamV2AppSubjectGetExamTypeGet,
  apiExamV2AppOrderInsertUserOrderPost,
} from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2'

vi.mock('@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2', () => ({
  apiExamV2AppSubjectGetExamTypeGet: vi.fn(),
  apiExamV2AppOrderInsertUserOrderPost: vi.fn(),
}))

describe('examProfile.remote', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listExamTypes', () => {
    it('extracts generated data correctly', async () => {
      ;(apiExamV2AppSubjectGetExamTypeGet as Mock).mockResolvedValue({
        data: {
          data: [
            { id: 1, name: 'Exam 1' },
          ],
        },
      })
      const result = await examProfileRemote.listExamTypes()
      expect(result).toHaveLength(1)
      expect(result[0]?.id).toBe('1')
      expect(result[0]?.name).toBe('Exam 1')
    })

    it('throws when envelope data is missing', async () => {
      ;(apiExamV2AppSubjectGetExamTypeGet as Mock).mockResolvedValue({
        data: {}, // no data payload
      })
      await expect(examProfileRemote.listExamTypes()).rejects.toThrow('考试类型未返回业务数据')
    })
    
    it('throws when envelope format is wrong', async () => {
      ;(apiExamV2AppSubjectGetExamTypeGet as Mock).mockResolvedValue({
        data: null, // response.data is null
      })
      await expect(examProfileRemote.listExamTypes()).rejects.toThrow('获取考试类型失败，未返回数据')
    })
  })

  describe('registerExamProfile', () => {
    it('calls API with correct payload', async () => {
      ;(apiExamV2AppOrderInsertUserOrderPost as Mock).mockResolvedValue({
        data: { data: true },
      })
      await examProfileRemote.registerExamProfile({
        examTypeId: 'type-1',
        examTypeName: 'Type 1',
        province: 'GD',
        provinceCode: '440000',
        inviteCode: '123',
      })
      expect(apiExamV2AppOrderInsertUserOrderPost).toHaveBeenCalledWith(
        {
          examTypeId: 'type-1',
          province: 'GD',
          provinceCode: '440000',
          iptInviteCode: '123',
        },
        expect.any(Object),
      )
    })
  })
})
