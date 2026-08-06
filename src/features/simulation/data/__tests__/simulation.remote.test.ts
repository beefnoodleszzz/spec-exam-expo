/* eslint-disable */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SimulationRemoteImpl } from '../simulation.remote.impl'
import * as generatedApi from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2'

vi.mock('@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2')

describe('SimulationRemoteImpl', () => {
  let remote: SimulationRemoteImpl

  beforeEach(() => {
    vi.clearAllMocks()
    remote = new SimulationRemoteImpl()
  })

  it('should fetch rule correctly', async () => {
    vi.mocked(generatedApi.apiExamV2AppSubjectGetMockExamGet).mockResolvedValue({
      data: { data: { time: 3600, subjectCount: 100 } }
    } as any)

    const rule = await remote.getRule('exam1')
    expect(rule.durationSeconds).toBe(216000)
    expect(rule.totalQuestions).toBe(100)
  })

  it('should create paper correctly', async () => {
    vi.mocked(generatedApi.apiExamV2AppSubjectGetMockExamGet).mockResolvedValue({
      data: { data: { time: 3600, subjectCount: 1 } }
    } as any)
    vi.mocked(generatedApi.apiExamV2AppSubjectGetSubjectsByGroupPost).mockResolvedValue({
      data: { data: { dataList: [{ subjectId: 'q1', type: 'single' }] } }
    } as any)

    const paper = await remote.createPaper('exam1')
    expect(paper.questions).toHaveLength(1)
  })

  it('should list history correctly', async () => {
    vi.mocked(generatedApi.apiExamV2AppSubjectGetGradeHistoryGet).mockResolvedValue({
      data: { data: { gradeHistories: [{ score: 100, isPass: true, createTime: '2023' }] } }
    } as any)

    const history = await remote.listHistory('exam1')
    expect(history).toHaveLength(1)
    expect(history[0]?.score).toBe(100)
  })
})
