import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest'
import { SimulationService } from '../simulation.service'
import { useSimulationSessionStore } from '../../state/simulation-session.store'
import { SimulationRemoteImpl } from '../../data/simulation.remote.impl'
import { queryClient } from '@/shared/query/query-client'

vi.mock('../../data/simulation.remote.impl')
vi.mock('@/shared/query/query-client', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}))

describe('SimulationService', () => {
  let service: SimulationService
  let remoteMock: Mocked<SimulationRemoteImpl>

  beforeEach(() => {
    vi.clearAllMocks()
    useSimulationSessionStore.setState({ sessions: {}, lastResult: null })
    
    service = new SimulationService()
    remoteMock = vi.mocked(new SimulationRemoteImpl())
    
    // Default mocks
    remoteMock.createPaper.mockResolvedValue({
      paperId: 'paper1',
      title: 'Test Exam',
      durationSeconds: 3600,
      questions: [{ questionId: 'q1', order: 0, score: null, subjectId: null }],
      startedAt: new Date().toISOString(),
      expiresAt: null,
    })
    
    remoteMock.submitPaper.mockResolvedValue({
      paperId: 'paper1',
      score: 100,
      totalScore: 100,
      correctCount: 1,
      wrongCount: 0,
      unansweredCount: 0,
      passed: true,
      durationSeconds: 60,
      questionResults: [],
    })

    // Inject mock into service
    ;(service as any).remote = remoteMock
  })

  it('should start an exam and initialize session', async () => {
    await service.startExam('exam1')
    
    const session = useSimulationSessionStore.getState().sessions['exam1']
    expect(session).toBeDefined()
    expect(session!.paperId).toBe('paper1')
    expect(session!.status).toBe('active')
    expect(session!.questionIds).toEqual(['q1'])
  })

  it('should get remaining seconds correctly', async () => {
    await service.startExam('exam1')
    
    const remaining = service.getRemainingSeconds('exam1')
    expect(remaining).toBeGreaterThan(0)
    expect(remaining).toBeLessThanOrEqual(3600)
  })

  it('should submit paper and clear session status to submitted', async () => {
    await service.startExam('exam1')
    
    const result = await service.submitPaper('exam1')
    
    expect(result.score).toBe(100)
    
    const session = useSimulationSessionStore.getState().sessions['exam1']
    expect(session!.status).toBe('submitted')
    expect(queryClient.invalidateQueries).toHaveBeenCalled()
  })
})
