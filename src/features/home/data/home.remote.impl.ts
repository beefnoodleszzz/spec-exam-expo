import { apiExamV2AppHomeGet } from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2'
import { createContractError } from '@/shared/api/errors/app-error'
import type { HomeRemote } from './home.remote'
import type { HomeDashboard, HomeNotice } from '../domain/home.types'
import { homeResponseSchema } from './home.schema'
import { extractGeneratedData } from '@/shared/api/generated-response'

export class HomeRemoteImpl implements HomeRemote {
  async getDashboard(signal?: AbortSignal): Promise<Omit<HomeDashboard, 'quickActions'>> {
    const options: RequestInit = {}
    if (signal) {
      options.signal = signal
    }
    const response = await apiExamV2AppHomeGet(options)

    if (!response.data) {
      throw createContractError('获取首页数据失败，未返回数据')
    }

    const rawData = extractGeneratedData(response.data, '首页')

    const parsed = homeResponseSchema.safeParse(rawData)
    if (!parsed.success) {
      throw createContractError('首页数据格式错误', parsed.error)
    }

    const dto = parsed.data

    const notices = dto.informationList?.dataList?.map((info, index) => {
      const notice: Record<string, string> = {
        id: info.id ?? [info.title ?? '', info.createTime ?? '', index].join(':'),
        title: info.title ?? '无标题',
        date: info.createTime ?? '',
      }
      if (info.description) notice.description = info.description
      if (info.image) notice.imageUrl = info.image
      return notice as unknown as HomeNotice
    }) ?? []

    return {
      examDay: dto.examDay ?? null,
      totalSubject: dto.totalSubject ?? 0,
      totalAnswer: dto.totalAnswer ?? 0,
      answerRate: dto.answerRate ?? '0%',
      banners: [],
      notices,
    }
  }
}

export const homeRemote = new HomeRemoteImpl()
