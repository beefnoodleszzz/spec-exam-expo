import {
  apiExamV2AppSubjectGetMockExamGet,
  apiExamV2AppSubjectGetSubjectsByGroupPost,
  apiExamV2AppSubjectSubmitExerciseRecordPut,
  apiExamV2AppSubjectGetGradeHistoryGet,
} from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2'
import { extractGeneratedData } from '@/shared/api/generated-response'
import { createContractError } from '@/shared/api/errors/app-error'
import { z } from 'zod'

import type {
  SimulationRemote,
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

import { simulationPaperDtoSchema } from './simulation-paper.schema'
import { simulationResultDtoSchema } from './simulation-result.schema'
import { simulationHistoryDtoSchema } from './simulation-history.schema'

export class SimulationRemoteImpl implements SimulationRemote {
  supportsRemoteProgressSave = false as const

  async getRule(
    examTypeId: string,
    signal?: AbortSignal,
  ): Promise<SimulationRule> {
    const options = signal ? { signal } : {}
    const response = await apiExamV2AppSubjectGetMockExamGet(
      { subjectGroupType: 2 },
      options,
    )
    const rawData = extractGeneratedData(
      response.data,
      '获取模拟考试规则',
    )

    const schema = z.object({
      time: z.number().optional().nullable(),
      subjectCount: z.number().optional().nullable(),
    }).passthrough()

    const parsed = schema.safeParse(rawData)
    if (!parsed.success) {
      throw createContractError('获取模拟考试规则数据结构错误', parsed.error)
    }

    return mapSimulationRule(examTypeId, parsed.data)
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
    const rawData = extractGeneratedData(
      response.data,
      '获取模拟考试试卷',
    )

    const parsed = simulationPaperDtoSchema.safeParse(rawData)
    if (!parsed.success) {
      throw createContractError('获取模拟考试试卷数据结构错误', parsed.error)
    }

    const paperId = crypto.randomUUID()

    return mapSimulationPaper(paperId, rule, parsed.data.dataList || [])
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
    const rawData = extractGeneratedData(
      response.data,
      '提交模拟考试试卷',
    )

    const parsed = simulationResultDtoSchema.safeParse(rawData)
    if (!parsed.success) {
      throw createContractError('提交模拟考试试卷数据结构错误', parsed.error)
    }
    const data = parsed.data

    return {
      paperId: input.session.paperId,
      score: data.score || 0,
      totalScore: null,
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



  async listHistory(
    examTypeId: string,
    signal?: AbortSignal,
  ): Promise<SimulationHistoryItem[]> {
    const options = signal ? { signal } : {}
    const response = await apiExamV2AppSubjectGetGradeHistoryGet(
      { subjectGroupType: 2 },
      options,
    )
    const rawData = extractGeneratedData(
      response.data,
      '获取模拟考试历史记录',
    )

    const parsed = simulationHistoryDtoSchema.safeParse(rawData)
    if (!parsed.success) {
      throw createContractError('获取模拟考试历史数据结构错误', parsed.error)
    }

    return mapSimulationHistory(examTypeId, parsed.data)
  }
}
