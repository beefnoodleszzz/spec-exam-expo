import React from 'react'
import { render } from '@testing-library/react-native'
import { ChapterListScreen } from './ChapterListScreen'

jest.mock('expo-image', () => ({ Image: 'Image' }))
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useLocalSearchParams: jest.fn(() => ({ subjectId: 's1', subjectName: 'Subject 1' }))
}))
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn().mockReturnValue({ isLoading: true, data: undefined }),
  queryOptions: jest.fn((opts) => opts)
}))
jest.mock('@/shared/auth/app-store', () => ({
  appStore: jest.fn().mockReturnValue('exam1')
}))
jest.mock('../application/practice.service', () => ({
  practiceService: { startPractice: jest.fn() }
}))

describe('ChapterListScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<ChapterListScreen />)
    expect(toJSON()).toBeTruthy()
  })
})
