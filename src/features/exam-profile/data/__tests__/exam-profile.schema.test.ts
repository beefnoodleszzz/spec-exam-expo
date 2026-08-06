import { examTypeListSchema } from '../exam-profile.schema'

describe('examProfile.schema', () => {
  it('validates a valid exam type list', () => {
    const data = [
      {
        id: '123',
        name: 'Test Exam',
        provinceRequired: true,
      },
    ]
    const result = examTypeListSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success && result.data) {
      expect(result.data[0]?.id).toBe('123')
      expect(result.data[0]?.name).toBe('Test Exam')
      expect(result.data[0]?.provinceRequired).toBe(true)
    }
  })

  it('handles numeric IDs', () => {
    const data = [{ id: 123 }]
    const result = examTypeListSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('accepts title or examTypeName instead of name', () => {
    const data = [
      { id: '1', title: 'Test Title' },
      { id: '2', examTypeName: 'Test Type' },
    ]
    const result = examTypeListSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success && result.data) {
      expect(result.data[0]?.title).toBe('Test Title')
      expect(result.data[1]?.examTypeName).toBe('Test Type')
    }
  })

  it('rejects invalid data', () => {
    const data = [{ notAnId: 'test' }]
    const result = examTypeListSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})
