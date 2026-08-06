import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { HomeScreen } from '../HomeScreen'
import { appStore } from '@/shared/auth/app-store'
import { sessionStore } from '@/shared/auth/session-store'

const mockUseQuery = jest.fn()

jest.mock('@tanstack/react-query', () => ({
  useQuery: (args: unknown) => mockUseQuery(args),
  queryOptions: (opts: unknown) => opts,
}))

const mockPush = jest.fn()
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

jest.mock('@/features/auth/auth.container', () => ({
  authService: {
    logout: jest.fn(),
  },
}))

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    appStore.setState({ currentExamProfile: { examTypeId: '1', examTypeName: 'T', province: null, provinceCode: null, inviteCode: null } })
    sessionStore.setState({ userId: 'user-123', status: 'authenticated' })
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: false, isError: false })
  })

  it('renders null if no exam profile', () => {
    appStore.setState({ currentExamProfile: null })
    const { toJSON } = render(<HomeScreen />)
    expect(toJSON()).toBeNull()
  })

  it('renders Loading skeleton', () => {
    mockUseQuery.mockReturnValue({ isLoading: true })
    const { UNSAFE_getByType } = render(<HomeScreen />)
    // Skeletons are standard Views
    expect(UNSAFE_getByType(HomeScreen)).toBeTruthy()
  })

  it('renders Error state', () => {
    const refetch = jest.fn()
    mockUseQuery.mockReturnValue({ isError: true, error: new Error('Err'), refetch })
    const { getByText } = render(<HomeScreen />)
    expect(getByText('加载失败')).toBeTruthy()
    fireEvent.press(getByText('重新加载'))
    expect(refetch).toHaveBeenCalled()
  })

  it('renders Dashboard with data', () => {
    mockUseQuery.mockReturnValue({
      data: {
        examDay: 5,
        totalSubject: 100,
        totalAnswer: 20,
        answerRate: '20%',
        banners: [],
        quickActions: [
          { id: 'random', title: '随机练习', route: 'practice' },
        ],
        notices: [
          { id: '1', title: 'Test Notice', date: '2023' }
        ]
      }
    })

    const { getByText } = render(<HomeScreen />)
    expect(getByText('当前科目：T')).toBeTruthy()
    expect(getByText('用户 user-123')).toBeTruthy()
    expect(getByText('考试倒计时：5 天')).toBeTruthy()
    expect(getByText('共有 100 题，已答 20')).toBeTruthy()
    expect(getByText('答题率 20%')).toBeTruthy()
    expect(getByText('Test Notice')).toBeTruthy()

    // Switch Exam Profile button
    fireEvent.press(getByText('切换'))
    expect(mockPush).toHaveBeenCalledWith('/(protected)/exam-profile')
    
    // Quick Action button
    fireEvent.press(getByText('随机练习'))
    expect(mockPush).toHaveBeenCalledWith('/(protected)/practice')
  })

  it('renders Error message inline if data exists (refreshing error)', () => {
    mockUseQuery.mockReturnValue({
      isError: true,
      error: new Error('Offline'),
      data: { banners: [], quickActions: [], notices: [] }
    })
    const { getByText } = render(<HomeScreen />)
    expect(getByText(/刷新失败/)).toBeTruthy()
  })
})
