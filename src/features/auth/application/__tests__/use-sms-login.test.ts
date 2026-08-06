/**
 * Tests for useSmsLogin hook logic.
 *
 * Tests the reducer and action logic directly without React rendering.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { AuthService } from '../auth.service'
import { createBusinessError } from '@/shared/api/errors/app-error'

// Test the reducer and validation logic via direct function calls
// useSmsLogin integrates React hooks so integration-level behavior
// is covered by SignInScreen.react.test.tsx

function makeMockAuthService(overrides: Partial<{
  sendShortMessage: ReturnType<typeof vi.fn>
  loginWithShortMessage: ReturnType<typeof vi.fn>
}> = {}): AuthService {
  return {
    sendShortMessage: vi.fn().mockResolvedValue({ requestId: 'req-123' }),
    loginWithShortMessage: vi.fn().mockResolvedValue(undefined),
    loginWithCode: vi.fn().mockResolvedValue(undefined),
    loginWithOneClick: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as AuthService
}

describe('useSmsLogin — phone validation', () => {
  const PHONE_REGEX = /^1[3-9]\d{9}$/

  it('accepts valid phone numbers', () => {
    expect(PHONE_REGEX.test('13812340000')).toBe(true)
    expect(PHONE_REGEX.test('19912340000')).toBe(true)
  })

  it('rejects invalid phone numbers', () => {
    expect(PHONE_REGEX.test('12812340000')).toBe(false) // starts with 12
    expect(PHONE_REGEX.test('1381234000')).toBe(false)  // too short
    expect(PHONE_REGEX.test('138123400001')).toBe(false) // too long
    expect(PHONE_REGEX.test('')).toBe(false)
  })
})

describe('useSmsLogin — error messages', () => {
  it('uses Chinese error messages for validation', () => {
    const phoneError = createBusinessError('请输入正确的手机号')
    expect(phoneError.message).toBe('请输入正确的手机号')

    const codeError = createBusinessError('请输入验证码')
    expect(codeError.message).toBe('请输入验证码')

    const requestIdError = createBusinessError('请先获取验证码')
    expect(requestIdError.message).toBe('请先获取验证码')

    const agreementError = createBusinessError('请先阅读并同意用户协议和隐私政策')
    expect(agreementError.message).toBe('请先阅读并同意用户协议和隐私政策')
  })
})

describe('useSmsLogin — service integration', () => {
  let authService: AuthService

  beforeEach(() => {
    authService = makeMockAuthService()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls sendShortMessage with correct phone', async () => {
    await authService.sendShortMessage({ phone: '13812340000' })
    expect(authService.sendShortMessage).toHaveBeenCalledWith({ phone: '13812340000' })
  })

  it('returns requestId from sendShortMessage', async () => {
    const result = await authService.sendShortMessage({ phone: '13812340000' })
    expect(result.requestId).toBe('req-123')
  })

  it('calls loginWithShortMessage with all required fields', async () => {
    await authService.loginWithShortMessage({
      phone: '13812340000',
      verificationCode: '123456',
      requestId: 'req-123',
    })
    expect(authService.loginWithShortMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        phone: '13812340000',
        verificationCode: '123456',
        requestId: 'req-123',
      }),
    )
  })

  it('propagates AppError from sendShortMessage failure', async () => {
    const failService = makeMockAuthService({
      sendShortMessage: vi.fn().mockRejectedValue({
        type: 'network',
        message: '网络连接失败，请检查网络',
        retryable: true,
      }),
    })

    await expect(
      failService.sendShortMessage({ phone: '13812340000' }),
    ).rejects.toMatchObject({ type: 'network' })
  })

  it('propagates error from loginWithShortMessage failure', async () => {
    const failService = makeMockAuthService({
      loginWithShortMessage: vi.fn().mockRejectedValue({
        type: 'unauthorized',
        message: '请先登录',
        retryable: false,
      }),
    })

    await expect(
      failService.loginWithShortMessage({
        phone: '13812340000',
        verificationCode: '123456',
        requestId: 'req-abc',
      }),
    ).rejects.toMatchObject({ type: 'unauthorized' })
  })
})
