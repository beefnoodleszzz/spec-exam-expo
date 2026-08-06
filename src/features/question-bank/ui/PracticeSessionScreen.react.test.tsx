import React from 'react'
import { render } from '@testing-library/react-native'
import { PracticeSessionScreen } from './PracticeSessionScreen'

jest.mock('expo-image', () => ({ Image: 'Image' }))
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() }))
}))
jest.mock('../state/practice-session.store', () => ({
  usePracticeSessionStore: jest.fn()
}))
jest.mock('../application/practice.service', () => ({
  practiceService: {
    loadPrevQuestion: jest.fn(),
    loadNextQuestion: jest.fn(),
    submitAnswer: jest.fn(),
    toggleFavorite: jest.fn(),
    submitSession: jest.fn()
  }
}))

describe('PracticeSessionScreen', () => {
  it('renders correctly when no session', () => {
    const storeMock = jest.mocked(require('../state/practice-session.store').usePracticeSessionStore)
    storeMock.mockImplementation((selector: (state: unknown) => unknown) => selector({ currentSession: null, isLoadingQuestion: false, questionsCache: {} }))
    
    const { getByText } = render(<PracticeSessionScreen />)
    expect(getByText('练习未开始')).toBeTruthy()
  })
})
