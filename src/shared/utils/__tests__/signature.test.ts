import { describe, it, expect } from 'vitest'
import { FuckingDSign, stringToByte } from '@/shared/utils/signature'

const CHECK_KEY = '80306f4370b39fd5630ad0529f77adb6'

describe('request signature', () => {
  it('stringToByte converts ASCII correctly', () => {
    const bytes = stringToByte('abc')
    expect(bytes).toEqual([97, 98, 99])
  })

  it('stringToByte converts hex string (CHECK_KEY format)', () => {
    const bytes = stringToByte('80')
    expect(bytes).toHaveLength(2)
    expect(bytes[0]).toBe(0x38)
    expect(bytes[1]).toBe(0x30)
  })

  it('FuckingDSign returns a 32-char hex string', () => {
    const key = stringToByte(CHECK_KEY)
    const result = FuckingDSign(12, 48, key)
    expect(typeof result).toBe('string')
    expect(result).toHaveLength(32)
    expect(/^[0-9a-f]+$/.test(result)).toBe(true)
  })

  it('FuckingDSign is deterministic for same index result', () => {
    // (0 + 0) % 3 === 0 → SignFun0 with b=32
    const key1 = stringToByte(CHECK_KEY)
    const key2 = stringToByte(CHECK_KEY)
    const r1 = FuckingDSign(0, 0, key1)
    const r2 = FuckingDSign(0, 0, key2)
    expect(r1).toBe(r2)
  })

  it('FuckingDSign produces different results for different index paths', () => {
    const key1 = stringToByte(CHECK_KEY)
    const key2 = stringToByte(CHECK_KEY)
    const key3 = stringToByte(CHECK_KEY)
    const r0 = FuckingDSign(0, 0, key1) // index 0
    const r1 = FuckingDSign(0, 1, key2) // index 1
    const r2 = FuckingDSign(0, 2, key3) // index 2
    // The three branches should produce different hashes
    expect(new Set([r0, r1, r2]).size).toBe(3)
  })
})
