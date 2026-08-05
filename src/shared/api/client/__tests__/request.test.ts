import { describe, it, expect } from 'vitest'
import { joinUrl, serializeQueryParams, type QueryValue } from '../request'


describe('request transport helpers', () => {
  describe('joinUrl', () => {
    it('joins base with trailing slash and path with leading slash without double slashes', () => {
      expect(joinUrl('https://api.com/', '/user/detail')).toBe('https://api.com/user/detail')
    })

    it('joins base without trailing slash and path without leading slash', () => {
      expect(joinUrl('https://api.com', 'user/detail')).toBe('https://api.com/user/detail')
    })

    it('handles multiple leading/trailing slashes', () => {
      expect(joinUrl('https://api.com///', '///user/detail')).toBe('https://api.com/user/detail')
    })
  })

  describe('serializeQueryParams', () => {
    it('returns empty string for empty or null params', () => {
      expect(serializeQueryParams(undefined)).toBe('')
      expect(serializeQueryParams({})).toBe('')
    })

    it('serializes primitives and filters null/undefined', () => {
      const result = serializeQueryParams({
        a: 'hello',
        b: 123,
        c: true,
        d: null,
        e: undefined,
      })
      expect(result).toBe('?a=hello&b=123&c=true')
    })

    it('serializes array values as repeated query params', () => {
      const result = serializeQueryParams({
        ids: [1, 2, 3],
      })
      expect(result).toBe('?ids=1&ids=2&ids=3')
    })

    it('throws contract error when plain object is passed as a query param', () => {
      expect(() =>
        serializeQueryParams({
          filter: { invalid: true } as unknown as QueryValue,
        }),
      ).toThrowError(/cannot be a plain object/)
    })

  })
})
