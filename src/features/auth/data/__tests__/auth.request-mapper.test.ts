import { describe, it, expect } from 'vitest'
import {
  mapShortMessageLogin,
  mapV2Login,
  mapSendShortMessage,
} from '../auth.request-mapper'

describe('auth.request-mapper', () => {
  describe('mapShortMessageLogin', () => {
    it('maps phone to mobile', () => {
      const command = {
        phone: '13812340000',
        verificationCode: '123456',
        requestId: 'req-123',
      }
      const dto = mapShortMessageLogin(command)
      expect(dto.mobile).toBe('13812340000')
    })

    it('maps verificationCode to code', () => {
      const command = {
        phone: '13812340000',
        verificationCode: '123456',
        requestId: 'req-123',
      }
      const dto = mapShortMessageLogin(command)
      expect(dto.code).toBe('123456')
    })

    it('includes requestId', () => {
      const command = {
        phone: '13812340000',
        verificationCode: '123456',
        requestId: 'req-123',
      }
      const dto = mapShortMessageLogin(command)
      expect(dto.requestId).toBe('req-123')
    })

    it('includes client config (system, terminal, clientType)', () => {
      const command = {
        phone: '13812340000',
        verificationCode: '123456',
        requestId: 'req-123',
      }
      const dto = mapShortMessageLogin(command)
      expect(dto.system).toBe(3)
      expect(dto.terminal).toBeDefined()
      expect(typeof dto.clientType).toBe('number')
    })

    it('maps inviteCode to iptInviteCode', () => {
      const command = {
        phone: '13812340000',
        verificationCode: '123456',
        requestId: 'req-123',
        inviteCode: 'ABC123',
      }
      const dto = mapShortMessageLogin(command)
      expect(dto.iptInviteCode).toBe('ABC123')
    })

    it('omits undefined optional fields', () => {
      const command = {
        phone: '13812340000',
        verificationCode: '123456',
        requestId: 'req-123',
      }
      const dto = mapShortMessageLogin(command)
      expect(dto.province).toBeUndefined()
      expect(dto.provinceCode).toBeUndefined()
    })
  })

  describe('mapV2Login', () => {
    it('maps code field', () => {
      const command = { code: 'wechat-code-123' }
      const dto = mapV2Login(command)
      expect(dto.code).toBe('wechat-code-123')
    })

    it('includes client config', () => {
      const command = { code: 'wechat-code-123' }
      const dto = mapV2Login(command)
      expect(dto.system).toBe(3)
      expect(typeof dto.clientType).toBe('number')
    })
  })

  describe('mapSendShortMessage', () => {
    it('maps phone to mobile', () => {
      const command = { phone: '13812340000' }
      const dto = mapSendShortMessage(command)
      expect(dto.mobile).toBe('13812340000')
    })
  })
})
