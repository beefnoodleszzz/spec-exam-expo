import React from 'react'
import { render } from '@testing-library/react-native'
import { QuestionCollectionScreen } from './QuestionCollectionScreen'

jest.mock('expo-image', () => ({ Image: 'Image' }))
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })),
  useLocalSearchParams: jest.fn(() => ({ mode: 'wrong' }))
}))
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn().mockReturnValue({ isLoading: true, data: undefined })
}))
jest.mock('@/shared/auth/app-store', () => ({
  appStore: jest.fn().mockReturnValue({ examTypeId: 'exam1' })
}))
jest.mock('../application/practice.service', () => ({
  practiceService: { startPractice: jest.fn() }
}))

describe('QuestionCollectionScreen', () => {
  it('renders loading state initially', () => {
    const { getByText } = render(<QuestionCollectionScreen />)
    expect(getByText('错题本')).toBeTruthy()
    expect(getByText('加载中...')).toBeTruthy()
  })
})
