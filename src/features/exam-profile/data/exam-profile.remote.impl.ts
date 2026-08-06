import { 
  apiExamV2AppSubjectGetExamTypeGet, 
  apiExamV2AppOrderInsertUserOrderPost 
} from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2'
import type { ExaminationManagePluginV2ViewVInsertUserOrder } from '@/shared/api/generated/models'
import { createContractError } from '@/shared/api/errors/app-error'
import type { ExamProfileRemote } from './exam-profile.remote'
import type { ExamProfile, ExamTypeOption } from '../domain/exam-profile.types'
import { examTypeListSchema } from './exam-profile.schema'

import { extractGeneratedData } from '@/shared/api/generated-response'

export class ExamProfileRemoteImpl implements ExamProfileRemote {
  async listExamTypes(signal?: AbortSignal): Promise<ExamTypeOption[]> {
    const options: RequestInit = {}
    if (signal) {
      options.signal = signal
    }
    const response = await apiExamV2AppSubjectGetExamTypeGet(undefined, options)
    
    if (!response.data) {
      throw createContractError('获取考试类型失败，未返回数据')
    }

    const rawData = extractGeneratedData(response.data, '考试类型')

    const parsed = examTypeListSchema.safeParse(rawData)
    if (!parsed.success) {
      throw createContractError('考试类型数据格式错误', parsed.error)
    }

    return parsed.data.map((dto) => ({
      id: String(dto.id),
      name: dto.examTypeName ?? dto.name ?? dto.title ?? '未命名考试',
      provinceRequired: dto.provinceRequired ?? false,
    }))
  }

  async registerExamProfile(profile: ExamProfile, signal?: AbortSignal): Promise<void> {
    const payload: ExaminationManagePluginV2ViewVInsertUserOrder = {
      examTypeId: profile.examTypeId,
    }
    if (profile.inviteCode) payload.iptInviteCode = profile.inviteCode
    if (profile.province) payload.province = profile.province
    if (profile.provinceCode) payload.provinceCode = profile.provinceCode
    
    const options: RequestInit = {}
    if (signal) {
      options.signal = signal
    }

    await apiExamV2AppOrderInsertUserOrderPost(payload, options)
  }
}

export const examProfileRemote = new ExamProfileRemoteImpl()
