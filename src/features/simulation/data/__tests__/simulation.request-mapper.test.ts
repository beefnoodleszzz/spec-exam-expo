/* eslint-disable */
import { describe, it, expect } from 'vitest'
import { mapSimulationRule, mapSimulationPaper, mapSubmitPaperRequest, mapSimulationHistory } from '../simulation.request-mapper'

describe('SimulationRequestMapper', () => {
  it('maps rule correctly', () => {
    const result = mapSimulationRule('exam1', { time: 3600, subjectCount: 100 })
    expect(result.durationSeconds).toBe(216000)
  })

  it('maps submit request correctly', () => {
    const session: any = {
      examTypeId: 'exam1',
      questionIds: ['q1'],
      answers: { 'q1': { answers: ['A'], marked: false } },
      startedAt: new Date().toISOString()
    }
    const result = mapSubmitPaperRequest(session)
    expect(result.examTypeId).toBe('exam1')
  })
})
