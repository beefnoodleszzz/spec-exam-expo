import { apiExamV2AppHomeGet } from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2'
import { createContractError } from '@/shared/api/errors/app-error'
import type { HomeRemote } from './home.remote'
import type { HomeDashboard, HomeQuickAction, HomeBanner, HomeNotice } from '../domain/home.types'
import { homeResponseSchema } from './home.schema'

const DEFAULT_QUICK_ACTIONS: HomeQuickAction[] = [
  { id: 'random', title: '随机练习', icon: 'shuffle', route: 'practice', params: { type: 'RANDOM' } },
  { id: 'order', title: '顺序练习', icon: 'list', route: 'practice', params: { type: 'ORDER' } },
  { id: 'simulation', title: '模拟考试', icon: 'document-text', route: 'simulation' },
  { id: 'quick', title: '快速练习', icon: 'flash', route: 'practice', params: { type: 'QUICK' } },
  { id: 'wrong', title: '错题集', icon: 'close-circle', route: 'questions', params: { type: 'WRONG' } },
  { id: 'favorite', title: '收藏夹', icon: 'star', route: 'questions', params: { type: 'FAVORITE' } },
]

const DEFAULT_BANNERS: HomeBanner[] = [
  { id: '1', imageUrl: 'https://via.placeholder.com/800x300.png?text=Banner+1' },
  { id: '2', imageUrl: 'https://via.placeholder.com/800x300.png?text=Banner+2' },
]

export class HomeRemoteImpl implements HomeRemote {
  async getDashboard(signal?: AbortSignal): Promise<HomeDashboard> {
    const options: RequestInit = {}
    if (signal) {
      options.signal = signal
    }
    const response = await apiExamV2AppHomeGet(options)

    if (!response.data) {
      throw createContractError('获取首页数据失败，未返回数据')
    }

    const parsed = homeResponseSchema.safeParse(response.data)
    if (!parsed.success) {
      throw createContractError('首页数据格式错误', parsed.error)
    }

    const dto = parsed.data

    const notices = dto.informationList?.dataList?.map((info) => {
      const notice: Record<string, string> = {
        id: info.id ?? String(Math.random()),
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
      banners: DEFAULT_BANNERS,
      notices,
      quickActions: DEFAULT_QUICK_ACTIONS,
    }
  }
}

export const homeRemote = new HomeRemoteImpl()
