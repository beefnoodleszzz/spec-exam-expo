import { describe, it, expect } from 'vitest'
import { mapListChaptersRequest } from './question-bank.request-mapper'

describe('QuestionBankRequestMapper', () => {
  describe('mapListChaptersRequest', () => {
    it('should map numeric subjectId to type safely', () => {
      const res = mapListChaptersRequest('1')
      expect(res).toEqual({
        type: 1,
        index: 1,
        size: 1000
      })
    })

    it('should throw if subjectId is not a valid safe integer', () => {
      expect(() => mapListChaptersRequest('invalid')).toThrow('无效的科目 ID')
      expect(() => mapListChaptersRequest('1.5')).toThrow('无效的科目 ID')
      expect(() => mapListChaptersRequest('NaN')).toThrow('无效的科目 ID')
    })
  })
})
