import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'

import { PracticeSessionScreen } from './PracticeSessionScreen'
import { usePracticeSessionStore } from '../state/practice-session.store'
import { practiceService } from '../application/practice.service'

jest.mock('expo-image', () => ({ Image: 'Image' }))
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() }))
}))
jest.mock('../state/practice-session.store', () => {
  const originalModule = jest.requireActual('../state/practice-session.store')
  return {
    ...originalModule,
    usePracticeSessionStore: Object.assign(jest.fn(), {
      getState: jest.fn()
    })
  }
})
jest.mock('../application/practice.service', () => ({
  practiceService: {
    loadPrevQuestion: jest.fn(),
    loadNextQuestion: jest.fn(),
    submitAnswer: jest.fn(),
    toggleFavorite: jest.fn(),
    submitSession: jest.fn(),
    retryAnswer: jest.fn()
  }
}))
jest.mock('react-native-render-html', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require('react-native')
  return function MockRenderHtml({ source }: { source: { html: string } }) {
    return <Text>{source.html}</Text>
  }
})

describe('PracticeSessionScreen UI', () => {
  let mockStoreState: Record<string, unknown>

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockStoreState = {
      currentSession: {
        currentIndex: 0,
        questionIds: ['q1'],
        answers: {},
        draftAnswers: {}
      },
      isLoadingQuestion: false,
      questionsCache: {
        'q1': {
          id: 'q1',
          type: 'single',
          stemHtml: '<p>Q1</p>',
          options: [
            { id: 'A', label: 'A', content: 'Opt A' },
            { id: 'B', label: 'B', content: 'Opt B' }
          ],
          correctAnswers: ['A'],
          userAnswers: [],
          isFavorite: false,
          explanationHtml: '<p>Exp</p>'
        }
      },
      actions: {
        setDraftAnswer: jest.fn((id: string, answers: string[]) => {
          ((mockStoreState as { currentSession: { draftAnswers: Record<string, string[]> } }).currentSession.draftAnswers)[id] = answers
          const storeMock = jest.mocked(usePracticeSessionStore)
          storeMock.mockImplementation((selector: unknown) => (selector as (state: unknown) => unknown)(mockStoreState))
        })
      }
    }

    // Mock both hook and getState
    const storeMock = jest.mocked(usePracticeSessionStore)
    storeMock.mockImplementation((selector: unknown) => (selector as (state: unknown) => unknown)(mockStoreState))
    ;(storeMock as unknown as { getState: () => unknown }).getState = () => mockStoreState
  })

  it('renders correctly when no session', () => {
    (mockStoreState as { currentSession: unknown }).currentSession = null
    const { getByText } = render(<PracticeSessionScreen />)
    expect(getByText('练习未开始')).toBeTruthy()
  })

  it('allows selecting option and does not submit immediately', () => {
    const { getByText, queryByText, rerender } = render(<PracticeSessionScreen />)
    fireEvent.press(getByText('A'))
    expect(practiceService.submitAnswer).not.toHaveBeenCalled()
    expect((mockStoreState.actions as never)['setDraftAnswer']).toHaveBeenCalledWith('q1', ['A'])
    
    // Select another option (single choice overwrites)
    fireEvent.press(getByText('B'))
    expect((mockStoreState.actions as never)['setDraftAnswer']).toHaveBeenCalledWith('q1', ['B'])
    
    // Re-render to reflect new mock state
    rerender(<PracticeSessionScreen />)

    // Submit button should appear
    expect(queryByText('提交答案')).toBeTruthy()
    
    fireEvent.press(getByText('提交答案'))
    expect(practiceService.submitAnswer).toHaveBeenCalledWith('q1', ['B'])
  })

  it('locks options when pending', () => {
    const s = mockStoreState as { currentSession: { answers: Record<string, unknown>, draftAnswers: Record<string, unknown> }, questionsCache: Record<string, { userAnswers: string[] }> }
    s.currentSession.answers['q1'] = { status: 'pending', answers: ['B'] }
    s.currentSession.draftAnswers['q1'] = ['B']
    
    const { getByText, queryByText } = render(<PracticeSessionScreen />)
    expect(getByText('答案提交中...')).toBeTruthy()
    expect(queryByText('提交答案')).toBeNull() // Should hide submit button
    
    fireEvent.press(getByText('A'))
    expect((mockStoreState.actions as never)['setDraftAnswer']).not.toHaveBeenCalled() // Locked
  })

  it('locks options and shows result when synced', () => {
    const s = mockStoreState as { currentSession: { answers: Record<string, unknown>, draftAnswers: Record<string, unknown> }, questionsCache: Record<string, { userAnswers: string[] }> }
    s.currentSession.answers['q1'] = { 
      status: 'synced', 
      answers: ['B'],
      serverCorrect: false,
      correctAnswers: ['A'],
      explanationHtml: '<p>Exp</p>'
    }
    s.currentSession.draftAnswers['q1'] = ['B']
    s.questionsCache!['q1']!.userAnswers = ['B']
    
    const { getByText, queryByText } = render(<PracticeSessionScreen />)
    expect(getByText('回答错误')).toBeTruthy()
    expect(getByText('正确答案: A')).toBeTruthy()
    expect(getByText('<p>Exp</p>')).toBeTruthy()
    
    expect(queryByText('提交答案')).toBeNull() // Should hide submit button
    
    fireEvent.press(getByText('A'))
    expect((mockStoreState.actions as never)['setDraftAnswer']).not.toHaveBeenCalled() // Locked
  })

  it('shows no explanation fallback', () => {
    const s = mockStoreState as { currentSession: { answers: Record<string, unknown>, draftAnswers: Record<string, unknown> }, questionsCache: Record<string, { userAnswers: string[] }> }
    s.currentSession.answers['q1'] = { 
      status: 'synced', 
      answers: ['B'],
      serverCorrect: false,
      correctAnswers: ['A'],
      explanationHtml: null
    }
    s.currentSession.draftAnswers['q1'] = ['B']
    s.questionsCache!['q1']!.userAnswers = ['B']
    
    const { getByText } = render(<PracticeSessionScreen />)
    expect(getByText('暂无答案解析')).toBeTruthy()
  })

  it('allows retry on failure', () => {
    const s = mockStoreState as { currentSession: { answers: Record<string, unknown>, draftAnswers: Record<string, unknown> }, questionsCache: Record<string, { userAnswers: string[] }> }
    s.currentSession.answers['q1'] = { status: 'failed', answers: ['B'] }
    s.currentSession.draftAnswers['q1'] = ['B']
    
    const { getByText } = render(<PracticeSessionScreen />)
    expect(getByText('答案提交失败')).toBeTruthy()
    expect(getByText('点击重试')).toBeTruthy()
    
    // Can still submit via main submit button or retry button
    fireEvent.press(getByText('点击重试'))
    expect(practiceService.submitAnswer).toHaveBeenCalledWith('q1', ['B']) // Retry now uses submitAnswer directly
  })
})

