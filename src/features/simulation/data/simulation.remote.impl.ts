import {
  apiExamV2AppSubjectGetMockExamGet,
  apiExamV2AppSubjectGetSubjectsByGroupPost,
  apiExamV2AppSubjectSubmitExerciseRecordPut,
  apiExamV2AppSubjectGetGradeHistoryGet,
} from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2'
import { extractGeneratedData } from '@/shared/api/generated-response'

import type {
  SimulationRemote,
  SaveSimulationProgressInput,
  SubmitSimulationPaperInput,
} from './simulation.remote'

import type { SimulationRule } from '../domain/simulation-rule.types'
import type { SimulationPaper } from '../domain/simulation-paper.types'
import type { SimulationResult } from '../domain/simulation-result.types'
import type { SimulationHistoryItem } from '../domain/simulation-history.types'

import {
  mapSimulationRule,
  mapSimulationPaper,
  mapSubmitPaperRequest,
  mapSimulationHistory,
} from './simulation.request-mapper'

export class SimulationRemoteImpl implements SimulationRemote {
  async getRule(
    examTypeId: string,
    signal?: AbortSignal,
  ): Promise<SimulationRule> {
    const options = signal ? { signal } : {}
    const response = await apiExamV2AppSubjectGetMockExamGet(
      { subjectGroupType: 2 },
      options,
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = extractGeneratedData(
      response.data,
      '获取模拟考试规则',
    ) as any

    return mapSimulationRule(examTypeId, data)
  }

  async createPaper(
    examTypeId: string,
    signal?: AbortSignal,
  ): Promise<SimulationPaper> {
    const options = signal ? { signal } : {}
    const rule = await this.getRule(examTypeId, signal)

    const response = await apiExamV2AppSubjectGetSubjectsByGroupPost(
      { subjectGroupType: 2 },
      options,
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = extractGeneratedData(
      response.data,
      '获取模拟考试试卷',
    ) as any

    // Use a random paperId since backend doesn't explicitly return one
    const paperId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    return mapSimulationPaper(paperId, rule, data.dataList || [])
  }

  async getPaper(
    _paperId: string,
    _signal?: AbortSignal,
  ): Promise<SimulationPaper> {
    // In legacy, we do not have an endpoint to fetch an existing paper by ID.
    // If we reach here, it implies restoring a session, which only requires the
    // questions already persisted or we just fetch the exam type again.
    // We'll throw an error and expect the service layer to handle restoring 
    // from local session storage instead of fetching from remote.
    throw new Error('Remote fetching of existing paper is not supported in legacy API. Use local session restore.')
  }

  async saveProgress(
    _input: SaveSimulationProgressInput,
    _signal?: AbortSignal,
  ): Promise<void> {
    // In legacy, intermediate saving wasn't supported via API.
    // The requirement states we need local debounce, which is handled in the Service/Store layer.
    // This remote implementation can be a no-op, or we can resolve it.
    return Promise.resolve()
  }

  async submitPaper(
    input: SubmitSimulationPaperInput,
    signal?: AbortSignal,
  ): Promise<SimulationResult> {
    const options = signal ? { signal } : {}
    const requestDto = mapSubmitPaperRequest(input.session)
    const response = await apiExamV2AppSubjectSubmitExerciseRecordPut(
      requestDto,
      options,
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = extractGeneratedData(
      response.data,
      '提交模拟考试试卷',
    ) as any

    return {
      paperId: input.session.paperId,
      score: data.score || 0,
      totalScore: 0, // Backend doesn't return totalScore here
      correctCount: data.subjectCorrectCount || 0,
      wrongCount: data.subjectErrorCount || 0,
      unansweredCount:
        input.session.questionIds.length -
        ((data.subjectCorrectCount || 0) + (data.subjectErrorCount || 0)),
      passed: data.isPass ?? null,
      durationSeconds: data.time || 0,
      questionResults: [], // Not returned by submit API
    }
  }

  async getResult(
    _paperId: string,
    _signal?: AbortSignal,
  ): Promise<SimulationResult> {
    // Like getPaper, the legacy backend doesn't provide a direct getResult(paperId) endpoint.
    // Result is obtained directly from the submitPaper response, or stored locally.
    throw new Error('Remote fetching of single result is not supported in legacy API. Use local cache or history.')
  }

  async listHistory(
    examTypeId: string,
    signal?: AbortSignal,
  ): Promise<SimulationHistoryItem[]> {
    const options = signal ? { signal } : {}
    const response = await apiExamV2AppSubjectGetGradeHistoryGet(
      { subjectGroupType: 2 },
      options,
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = extractGeneratedData(
      response.data,
      '获取模拟考试历史记录',
    ) as any

    return mapSimulationHistory(examTypeId, data)
  }
}
