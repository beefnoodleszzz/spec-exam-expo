import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { ExamProfileSelectionScreen } from '../ExamProfileSelectionScreen'

const mockUseQuery = jest.fn()
const mockUseMutation = jest.fn()

jest.mock('@tanstack/react-query', () => ({
  useQuery: (args: unknown) => mockUseQuery(args),
  useMutation: (args: unknown) => mockUseMutation(args),
}))

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}))

jest.mock('../../application/exam-profile.service', () => ({
  examProfileService: {
    switchExamProfile: jest.fn(),
  },
}))

describe('ExamProfileSelectionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    })
  })

  it('renders Loading state', () => {
    mockUseQuery.mockReturnValue({ isLoading: true })
    const { getByText } = render(<ExamProfileSelectionScreen />)
    expect(getByText('正在加载考试类型...')).toBeTruthy()
  })

  it('renders Error state and allows retry', () => {
    const refetch = jest.fn()
    mockUseQuery.mockReturnValue({ 
      error: new Error('Network Error'), 
      refetch 
    })
    const { getByText } = render(<ExamProfileSelectionScreen />)
    expect(getByText('加载失败')).toBeTruthy()
    fireEvent.press(getByText('重新加载'))
    expect(refetch).toHaveBeenCalled()
  })

  it('renders Empty state', () => {
    mockUseQuery.mockReturnValue({ data: [] })
    const { getByText } = render(<ExamProfileSelectionScreen />)
    expect(getByText('当前没有可用的考试类型')).toBeTruthy()
  })

  it('renders items and allows selection and confirmation', async () => {
    mockUseQuery.mockReturnValue({ 
      data: [
        { id: '1', name: 'Exam 1' },
        { id: '2', name: 'Exam 2' },
      ] 
    })
    const mutate = jest.fn()
    mockUseMutation.mockReturnValue({
      mutate,
      isPending: false,
    })

    const { getByText } = render(<ExamProfileSelectionScreen />)
    
    // Select an item
    fireEvent.press(getByText('Exam 2'))

    // Confirm selection
    fireEvent.press(getByText('确认选择'))

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({ id: '2', name: 'Exam 2' })
    })
  })
})
