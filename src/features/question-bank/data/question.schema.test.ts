import { questionSchema } from './question.schema'

describe('questionSchema', () => {
  it('should parse valid single choice question', () => {
    const valid = {
      id: 'q1',
      type: 'single',
      stemHtml: 'What is 1+1?',
      options: [
        { id: 'A', label: 'A', content: '2' },
        { id: 'B', label: 'B', content: '3' }
      ],
      correctAnswers: ['A'],
      explanationHtml: 'Math.',
      isFavorite: false,
      userAnswers: []
    }
    const result = questionSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('should parse valid multiple choice question', () => {
    const valid = {
      id: 'q1',
      type: 'multiple',
      stemHtml: 'Which are numbers?',
      options: [
        { id: 'A', label: 'A', content: '1' },
        { id: 'B', label: 'B', content: 'Two' }
      ],
      correctAnswers: ['A', 'B'],
      explanationHtml: 'Math.',
      isFavorite: true,
      userAnswers: []
    }
    const result = questionSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })
})
