/**
 * Tests for AuthRemoteImpl.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthRemoteImpl } from '../auth.remote.impl'
import {
  apiExamV2AppLoginShortMessagePost,
  apiExamV2AppLoginSendShortMessageGet,
  apiExamV2AppUserDetailGet,
} from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2'

// vi.mock is hoisted to top by Vitest — runs before imports above at runtime
vi.mock(
  '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2',
  () => ({
    apiExamV2AppLoginShortMessagePost: vi.fn(),
    apiExamV2AppLoginPost: vi.fn(),
    apiExamV2AppLoginSendShortMessageGet: vi.fn(),
    apiExamV2AppUserDetailGet: vi.fn(),
  }),
)

const mockSmsGet = apiExamV2AppLoginSendShortMessageGet as ReturnType<typeof vi.fn>
const mockShortMsgPost = apiExamV2AppLoginShortMessagePost as ReturnType<typeof vi.fn>
const mockUserDetailGet = apiExamV2AppUserDetailGet as ReturnType<typeof vi.fn>

describe('AuthRemoteImpl', () => {
  let remote: AuthRemoteImpl

  beforeEach(() => {
    remote = new AuthRemoteImpl()
    vi.clearAllMocks()
  })

  describe('sendShortMessage', () => {
    it('returns requestId on success', async () => {
      mockSmsGet.mockResolvedValue({
        status: true,
        data: { requestId: 'req-abc' },
      })

      const result = await remote.sendShortMessage({ phone: '13812340000' })
      expect(result.requestId).toBe('req-abc')
    })

    it('throws ContractError when requestId missing', async () => {
      mockSmsGet.mockResolvedValue({ status: true, data: {} })

      await expect(
        remote.sendShortMessage({ phone: '13800000000' }),
      ).rejects.toMatchObject({ name: 'ContractError' })
    })

    it('throws ContractError when envelope data missing', async () => {
      mockSmsGet.mockResolvedValue({ status: true })

      await expect(
        remote.sendShortMessage({ phone: '13800000000' }),
      ).rejects.toMatchObject({ name: 'ContractError' })
    })
  })

  describe('loginWithShortMessage', () => {
    it('returns session with token and userId', async () => {
      mockShortMsgPost.mockResolvedValue({
        status: true,
        data: { token: 'tok-123', userId: 'u-456' },
      })

      const session = await remote.loginWithShortMessage({
        phone: '13812340000',
        verificationCode: '123456',
        requestId: 'req-abc',
      })

      expect(session.accessToken).toBe('tok-123')
      expect(session.userId).toBe('u-456')
    })

    it('throws ContractError when token missing', async () => {
      mockShortMsgPost.mockResolvedValue({ status: true, data: {} })

      await expect(
        remote.loginWithShortMessage({
          phone: '13812340000',
          verificationCode: '123456',
          requestId: 'req-abc',
        }),
      ).rejects.toMatchObject({ name: 'ContractError' })
    })
  })

  describe('getCurrentUser', () => {
    it('returns mapped user', async () => {
      mockUserDetailGet.mockResolvedValue({
        status: true,
        data: {
          id: 'u1',
          mobile: '13812340000',
          nickName: 'Test User',
          avatarUrl: 'http://img',
        },
      })

      const user = await remote.getCurrentUser()
      expect(user.id).toBe('u1')
      expect(user.phone).toBe('13812340000')
      expect(user.nickname).toBe('Test User')
    })

    it('does NOT fall back to getUserInfoByToken on error', async () => {
      const error = new Error('Network error')
      mockUserDetailGet.mockRejectedValue(error)

      await expect(remote.getCurrentUser()).rejects.toThrow('Network error')
    })
  })
})
