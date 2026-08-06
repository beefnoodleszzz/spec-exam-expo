import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Mocked } from 'vitest'
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
    vi.useFakeTimers()
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
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
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

    ;(service as unknown as { remote: SimulationRemoteImpl }).remote = remoteMock
  })
  
  afterEach(() => {
    vi.useRealTimers()
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

  it('should handle manual submit successfully', async () => {
    await service.startExam('exam1')
    
    const promise = service.submitPaper('exam1', 'manual')
    const sessionSubmitting = useSimulationSessionStore.getState().sessions['exam1']
    expect(sessionSubmitting!.status).toBe('submitting')

    const result = await promise
    
    expect(result.score).toBe(100)
    
    const session = useSimulationSessionStore.getState().sessions['exam1']
    expect(session!.status).toBe('submitted')
    expect(queryClient.invalidateQueries).toHaveBeenCalled()
  })

  it('should handle manual submit failure and revert to active', async () => {
    await service.startExam('exam1')
    
    remoteMock.submitPaper.mockRejectedValueOnce(new Error('Network error'))
    
    await expect(service.submitPaper('exam1', 'manual')).rejects.toThrow()
    
    const session = useSimulationSessionStore.getState().sessions['exam1']
    expect(session!.status).toBe('active') // Should revert to active for manual
  })

  it('should handle timeout submit failure and set to submit_failed', async () => {
    await service.startExam('exam1')
    
    remoteMock.submitPaper.mockRejectedValueOnce(new Error('Network error'))
    
    await expect(service.submitPaper('exam1', 'timeout')).rejects.toThrow()
    
    const session = useSimulationSessionStore.getState().sessions['exam1']
    expect(session!.status).toBe('submit_failed') // Should set to submit_failed for timeout
  })

  it('should not submit if already submitting (single-flight)', async () => {
    await service.startExam('exam1')
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolveSubmit: (val: any) => void = () => {}
    remoteMock.submitPaper.mockReturnValueOnce(new Promise(resolve => {
      resolveSubmit = resolve
    }))
    
    const p1 = service.submitPaper('exam1', 'manual')
    const p2 = service.submitPaper('exam1', 'manual')
    void p2
    
    resolveSubmit({
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
    
    await p1
    expect(remoteMock.submitPaper).toHaveBeenCalledTimes(1)
  })

  it('should ignore handleTimeout if status is submit_failed', async () => {
    await service.startExam('exam1')
    useSimulationSessionStore.getState().updateStatus('exam1', 'submit_failed')
    service.handleTimeout('exam1')
    expect(remoteMock.submitPaper).not.toHaveBeenCalled()
  })

  it('should only automatically submit once on timeout', async () => {
    await service.startExam('exam1')
    service.handleTimeout('exam1')
    expect(useSimulationSessionStore.getState().sessions['exam1']!.status).toBe('submitting')
    service.handleTimeout('exam1') // second time should be ignored
    expect(remoteMock.submitPaper).toHaveBeenCalledTimes(1)
  })

  it('should remain in submit_failed if manual submit fails after timeout', async () => {
    await service.startExam('exam1')
    // Set expiry to past to simulate timeout scenario during manual submit
    useSimulationSessionStore.getState().setSession('exam1', {
      ...useSimulationSessionStore.getState().sessions['exam1']!,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    })
    
    remoteMock.submitPaper.mockRejectedValueOnce(new Error('Network error'))
    
    await expect(service.submitPaper('exam1', 'manual')).rejects.toThrow()
    const session = useSimulationSessionStore.getState().sessions['exam1']
    expect(session!.status).toBe('submit_failed')
  })
})
