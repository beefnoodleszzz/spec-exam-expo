import { describe, it, expect } from 'vitest'
import { sanitizeContract } from '../contract-redaction'

describe('sanitizeContract', () => {
  it('redacts token field', () => {
    const input = { token: 'secret123' }
    const result = sanitizeContract(input)
    expect(result).toEqual({
      token: '<ACCESS_TOKEN>',
    })
  })

  it('redacts accessToken field', () => {
    const input = { accessToken: 'xyz789' }
    const result = sanitizeContract(input)
    expect(result).toEqual({
      accessToken: '<ACCESS_TOKEN>',
    })
  })

  it('redacts examToken field', () => {
    const input = { examToken: 'exam-secret' }
    const result = sanitizeContract(input)
    expect(result).toEqual({
      examToken: '<ACCESS_TOKEN>',
    })
  })

  it('redacts userId field', () => {
    const input = { userId: '12345' }
    const result = sanitizeContract(input)
    expect(result).toEqual({
      userId: '<USER_ID>',
    })
  })

  it('redacts phone field', () => {
    const input = { phone: '13812340000' }
    const result = sanitizeContract(input)
    expect(result).toEqual({
      phone: '1381234****',
    })
  })

  it('preserves generic id fields', () => {
    const input = { id: 123 }
    const result = sanitizeContract(input)
    expect(result).toEqual({
      id: 123,
    })
  })

  it('preserves examTypeId field', () => {
    const input = { examTypeId: 'exam-1' }
    const result = sanitizeContract(input)
    expect(result).toEqual({
      examTypeId: 'exam-1',
    })
  })

  it('preserves provinceCode field', () => {
    const input = { provinceCode: '510000' }
    const result = sanitizeContract(input)
    expect(result).toEqual({
      provinceCode: '510000',
    })
  })

  it('preserves clientType field', () => {
    const input = { clientType: 2 }
    const result = sanitizeContract(input)
    expect(result).toEqual({
      clientType: 2,
    })
  })

  it('redacts nested objects', () => {
    const input = {
      user: {
        userId: '12345',
        phone: '13812340000',
      },
    }
    const result = sanitizeContract(input)
    expect(result).toEqual({
      user: {
        userId: '<USER_ID>',
        phone: '1381234****',
      },
    })
  })

  it('redacts array items', () => {
    const input = {
      users: [
        { userId: '1', phone: '13812340000' },
        { userId: '2', phone: '13912340000' },
      ],
    }
    const result = sanitizeContract(input)
    expect(result).toEqual({
      users: [
        { userId: '<USER_ID>', phone: '1381234****' },
        { userId: '<USER_ID>', phone: '1391234****' },
      ],
    })
  })

  it('case insensitive redaction', () => {
    const input = { USERID: 'abc', Token: 'xyz' }
    const result = sanitizeContract(input)
    expect(result).toEqual({
      USERID: '<USER_ID>',
      Token: '<ACCESS_TOKEN>',
    })
  })

  it('preserves null values', () => {
    const input = {
      userId: null,
      phone: null,
    }
    const result = sanitizeContract(input)
    expect(result).toEqual({
      userId: null,
      phone: null,
    })
  })

  it('preserves non-object primitives', () => {
    const input = {
      count: 123,
      active: true,
      name: 'John',
    }
    const result = sanitizeContract(input)
    expect(result).toEqual({
      count: 123,
      active: true,
      name: 'John',
    })
  })

  it('does not mutate input', () => {
    const input = { userId: '123', phone: '13812340000' }
    const inputCopy = JSON.parse(
      JSON.stringify(input),
    )
    sanitizeContract(input)
    expect(input).toEqual(inputCopy)
  })

  it('handles complex nested structure', () => {
    const input = {
      status: true,
      data: {
        examToken: 'secret',
        userInfo: {
          userId: 'uid-123',
          phone: '13812340000',
          id: 'ignored',
          examTypeId: 'exam-1',
        },
        items: [
          { id: '1', userId: 'u1', phone: '13912340000' },
          { id: '2', userId: 'u2', phone: '13812340000' },
        ],
      },
    }
    const result = sanitizeContract(input)
    expect(result).toEqual({
      status: true,
      data: {
        examToken: '<ACCESS_TOKEN>',
        userInfo: {
          userId: '<USER_ID>',
          phone: '1381234****',
          id: 'ignored',
          examTypeId: 'exam-1',
        },
        items: [
          {
            id: '1',
            userId: '<USER_ID>',
            phone: '1391234****',
          },
          { id: '2', userId: '<USER_ID>', phone: '1381234****' },
        ],
      },
    })
  })
})
