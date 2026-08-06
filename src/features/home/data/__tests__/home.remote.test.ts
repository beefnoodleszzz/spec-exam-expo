import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { homeRemote } from '../home.remote.impl'
import { apiExamV2AppHomeGet } from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2'

vi.mock('@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2', () => ({
  apiExamV2AppHomeGet: vi.fn(),
}))

describe('home.remote', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('extracts generated data and maps correctly', async () => {
    ;(apiExamV2AppHomeGet as Mock).mockResolvedValue({
      data: {
        data: {
          examDay: 10,
          totalSubject: 100,
          totalAnswer: 20,
          answerRate: '20%',
          informationList: {
            dataList: [
              { id: 'n1', title: 'Notice 1', createTime: '2023-01-01' },
              { title: 'Notice 2' }
            ]
          }
        },
      },
    })
    const result = await homeRemote.getDashboard()
    
    expect(result.examDay).toBe(10)
    expect(result.totalSubject).toBe(100)
    expect(result.banners).toEqual([])
    
    // Stable notice IDs
    expect(result.notices[0]?.id).toBe('n1')
    expect(result.notices[1]?.id).toBe('Notice 2::1') // title + createTime + index
  })

  it('throws on business data missing', async () => {
    ;(apiExamV2AppHomeGet as Mock).mockResolvedValue({
      data: {}, // envelope without data payload
    })
    await expect(homeRemote.getDashboard()).rejects.toThrow('首页未返回业务数据')
  })

  it('throws on schema error (invalid data types)', async () => {
    ;(apiExamV2AppHomeGet as Mock).mockResolvedValue({
      data: {
        data: {
          examDay: 'not a number',
        },
      },
    })
    await expect(homeRemote.getDashboard()).rejects.toThrow('首页数据格式错误')
  })

  it('handles null values correctly', async () => {
    ;(apiExamV2AppHomeGet as Mock).mockResolvedValue({
      data: {
        data: {
          examDay: null,
          totalSubject: undefined,
          totalAnswer: undefined,
          answerRate: undefined,
        },
      },
    })
    const result = await homeRemote.getDashboard()
    expect(result.examDay).toBeNull()
    expect(result.totalSubject).toBe(0)
    expect(result.totalAnswer).toBe(0)
    expect(result.answerRate).toBe('0%')
    expect(result.notices).toEqual([])
  })
})
