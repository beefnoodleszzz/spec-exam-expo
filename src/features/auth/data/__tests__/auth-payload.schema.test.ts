/**
 * Tests for auth payload schemas and extractor functions.
 */

import { describe, it, expect } from 'vitest'
import {
  authLoginPayloadSchema,
  authUserPayloadSchema,
  sendShortMessagePayloadSchema,
  extractAccessToken,
  extractUserId,
  extractRequestId,
  mapAuthUser,
} from '../auth-payload.schema'

describe('authLoginPayloadSchema', () => {
  it('accepts token field', () => {
    const result = authLoginPayloadSchema.safeParse({ token: 'tok-123' })
    expect(result.success).toBe(true)
  })

  it('accepts accesstoken field (legacy)', () => {
    const result = authLoginPayloadSchema.safeParse({ accesstoken: 'tok-abc' })
    expect(result.success).toBe(true)
  })

  it('accepts userId as string', () => {
    const result = authLoginPayloadSchema.safeParse({ token: 'x', userId: 'u1' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.userId).toBe('u1')
  })

  it('accepts userId as number', () => {
    const result = authLoginPayloadSchema.safeParse({ token: 'x', userId: 42 })
    expect(result.success).toBe(true)
  })

  it('passes through extra fields', () => {
    const result = authLoginPayloadSchema.safeParse({ token: 'x', extraField: true })
    expect(result.success).toBe(true)
  })
})

describe('extractAccessToken', () => {
  it('extracts token field', () => {
    const payload = authLoginPayloadSchema.parse({ token: 'tok-123' })
    expect(extractAccessToken(payload)).toBe('tok-123')
  })

  it('falls back to accesstoken field', () => {
    const payload = authLoginPayloadSchema.parse({ accesstoken: 'tok-fallback' })
    expect(extractAccessToken(payload)).toBe('tok-fallback')
  })

  it('throws ContractError when no token', () => {
    const payload = authLoginPayloadSchema.parse({})
    expect(() => extractAccessToken(payload)).toThrow()
    try {
      extractAccessToken(payload)
    } catch (e) {
      expect((e as Error).name).toBe('ContractError')
    }
  })
})

describe('extractUserId', () => {
  it('extracts userId string', () => {
    const payload = authLoginPayloadSchema.parse({ token: 'x', userId: 'u1' })
    expect(extractUserId(payload)).toBe('u1')
  })

  it('converts numeric userId to string', () => {
    const payload = authLoginPayloadSchema.parse({ token: 'x', userId: 99 })
    expect(extractUserId(payload)).toBe('99')
  })

  it('returns null when not present', () => {
    const payload = authLoginPayloadSchema.parse({ token: 'x' })
    expect(extractUserId(payload)).toBeNull()
  })
})

describe('extractRequestId', () => {
  it('extracts requestId field', () => {
    const payload = sendShortMessagePayloadSchema.parse({ requestId: 'req-1' })
    expect(extractRequestId(payload)).toBe('req-1')
  })

  it('extracts lowercase requestid variant', () => {
    const payload = sendShortMessagePayloadSchema.parse({ requestid: 'req-2' })
    expect(extractRequestId(payload)).toBe('req-2')
  })

  it('throws ContractError when missing', () => {
    const payload = sendShortMessagePayloadSchema.parse({})
    expect(() => extractRequestId(payload)).toThrow()
    try {
      extractRequestId(payload)
    } catch (e) {
      expect((e as Error).name).toBe('ContractError')
    }
  })
})

describe('authUserPayloadSchema', () => {
  it('accepts id as string', () => {
    const result = authUserPayloadSchema.safeParse({ id: 'u1' })
    expect(result.success).toBe(true)
  })

  it('accepts mobile and nickName', () => {
    const result = authUserPayloadSchema.safeParse({ mobile: '138', nickName: 'Bob' })
    expect(result.success).toBe(true)
  })

  it('passes through extra fields', () => {
    const result = authUserPayloadSchema.safeParse({ id: '1', unknown: true })
    expect(result.success).toBe(true)
  })
})

describe('mapAuthUser', () => {
  it('maps standard fields', () => {
    const payload = authUserPayloadSchema.parse({
      id: 'u1',
      mobile: '138',
      nickName: 'Bob',
      avatarUrl: 'http://img',
    })
    const user = mapAuthUser(payload)
    expect(user.id).toBe('u1')
    expect(user.phone).toBe('138')
    expect(user.nickname).toBe('Bob')
    expect(user.avatarUrl).toBe('http://img')
  })

  it('uses headImg fallback for avatarUrl', () => {
    const payload = authUserPayloadSchema.parse({ id: '1', headImg: 'img2' })
    const user = mapAuthUser(payload)
    expect(user.avatarUrl).toBe('img2')
  })

  it('returns null id when undefined', () => {
    const payload = authUserPayloadSchema.parse({})
    const user = mapAuthUser(payload)
    expect(user.id).toBeNull()
  })
})
