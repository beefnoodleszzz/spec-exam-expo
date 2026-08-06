import React from 'react'
import { render } from '@testing-library/react-native'
import { SubjectListScreen } from './SubjectListScreen'

jest.mock('expo-image', () => ({ Image: 'Image' }))
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}))
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn().mockReturnValue({ isLoading: true, data: undefined }),
  queryOptions: jest.fn((opts) => opts)
}))
jest.mock('@/shared/auth/app-store', () => ({
  appStore: jest.fn().mockReturnValue('exam1')
}))
jest.mock('../application/practice.service', () => ({
  practiceService: { resumeSession: jest.fn() }
}))
jest.mock('../state/practice-session.store', () => ({
  usePracticeSessionStore: jest.fn().mockReturnValue(null)
}))

describe('SubjectListScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<SubjectListScreen />)
    expect(toJSON()).toBeTruthy()
  })
})
