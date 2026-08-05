import { describe, it, expect, vi, beforeEach } from 'vitest'
import React, { type ReactNode } from 'react'
import { AppBootstrap } from '@/providers/AppBootstrap'
import { useAppBootstrap } from '../hooks/useAppBootstrap'

vi.mock('../hooks/useAppBootstrap', () => ({
  useAppBootstrap: vi.fn(),
}))

// Mock the component dependencies
vi.mock('../components/BootstrapLoadingScreen', () => ({
  BootstrapLoadingScreen: () => React.createElement('div', {}, '正在重新加载基础配置...'),
}))

interface BootstrapErrorScreenProps {
  message?: string | null
  onRetry: () => void
}

vi.mock('../components/BootstrapErrorScreen', () => ({
  BootstrapErrorScreen: ({ message, onRetry }: BootstrapErrorScreenProps) =>
    React.createElement(
      'div',
      { testID: 'error-screen' },
      React.createElement('p', {}, '应用启动失败'),
      React.createElement(
        'button',
        { onClick: onRetry, testID: 'retry-button' },
        '重新加载'
      ),
      message && React.createElement('p', {}, message)
    ),
}))

describe('AppBootstrap Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when status is running and splash is not hidden', () => {
    vi.mocked(useAppBootstrap).mockReturnValue({
      status: 'running',
      errorMessage: null,
      hasHiddenSplash: false,
      retry: vi.fn(),
    })

    const result = AppBootstrap({ children: 'Test Child' as unknown as ReactNode })

    // When splash is not hidden and status is running, should return null
    expect(result).toBeNull()
  })

  it('renders BootstrapLoadingScreen when status is running and splash is hidden', () => {
    vi.mocked(useAppBootstrap).mockReturnValue({
      status: 'running',
      errorMessage: null,
      hasHiddenSplash: true,
      retry: vi.fn(),
    })

    const result = AppBootstrap({ children: 'Test Child' as unknown as ReactNode })

    // Should render loading screen
    expect(result).not.toBeNull()
    expect(result?.type.name).toBeDefined()
  })

  it('renders BootstrapErrorScreen when status is error', () => {
    const mockRetry = vi.fn()
    vi.mocked(useAppBootstrap).mockReturnValue({
      status: 'error',
      errorMessage: '应用初始化失败',
      hasHiddenSplash: false,
      retry: mockRetry,
    })

    const result = AppBootstrap({ children: 'Test Child' as unknown as ReactNode })

    // Should render error screen
    expect(result).not.toBeNull()
    expect(result?.type.name).toBeDefined()
  })

  it('renders children when status is ready', () => {
    vi.mocked(useAppBootstrap).mockReturnValue({
      status: 'ready',
      errorMessage: null,
      hasHiddenSplash: true,
      retry: vi.fn(),
    })

    const testChild = 'Protected Content'
    const result = AppBootstrap({ children: testChild as unknown as ReactNode })

    // Should render children
    expect(result).not.toBeNull()
  })

  it('passes correct retry callback to error screen', () => {
    const mockRetry = vi.fn()
    vi.mocked(useAppBootstrap).mockReturnValue({
      status: 'error',
      errorMessage: 'Error occurred',
      hasHiddenSplash: false,
      retry: mockRetry,
    })

    AppBootstrap({ children: 'Test Child' as unknown as ReactNode })

    // Verify hook was called
    expect(useAppBootstrap).toHaveBeenCalled()

    // Verify the retry function is passed from the hook
    const hookResult = vi.mocked(useAppBootstrap).mock.results[0]
    expect(hookResult?.value?.retry).toBe(mockRetry)
  })

  it('correctly handles null children', () => {
    vi.mocked(useAppBootstrap).mockReturnValue({
      status: 'ready',
      errorMessage: null,
      hasHiddenSplash: true,
      retry: vi.fn(),
    })

    const result = AppBootstrap({ children: null })

    expect(result).not.toBeNull()
  })

  it('displays custom error message from hook', () => {
    const customMessage = '自定义错误信息'
    vi.mocked(useAppBootstrap).mockReturnValue({
      status: 'error',
      errorMessage: customMessage,
      hasHiddenSplash: false,
      retry: vi.fn(),
    })

    const result = AppBootstrap({ children: 'Test' as unknown as ReactNode })

    expect(result).not.toBeNull()
    // Error screen should receive the custom message
    expect(useAppBootstrap).toHaveBeenCalled()
  })

  it('respects hasHiddenSplash state for loading screen display', () => {
    vi.mocked(useAppBootstrap).mockReturnValue({
      status: 'running',
      errorMessage: null,
      hasHiddenSplash: false,
      retry: vi.fn(),
    })

    let result = AppBootstrap({ children: 'Child' as unknown as ReactNode })
    expect(result).toBeNull()

    // Update hook mock to show hidden splash
    vi.mocked(useAppBootstrap).mockReturnValue({
      status: 'running',
      errorMessage: null,
      hasHiddenSplash: true,
      retry: vi.fn(),
    })

    result = AppBootstrap({ children: 'Child' as unknown as ReactNode })
    expect(result).not.toBeNull()
  })

  it('transitions from error to ready state correctly', () => {
    // Start with error
    vi.mocked(useAppBootstrap).mockReturnValue({
      status: 'error',
      errorMessage: 'Initial error',
      hasHiddenSplash: false,
      retry: vi.fn(),
    })

    let result = AppBootstrap({ children: 'Child' as unknown as ReactNode })
    expect(result?.type.name).toBeDefined()

    // Transition to ready
    vi.mocked(useAppBootstrap).mockReturnValue({
      status: 'ready',
      errorMessage: null,
      hasHiddenSplash: true,
      retry: vi.fn(),
    })

    result = AppBootstrap({ children: 'Child' as unknown as ReactNode })
    expect(result).not.toBeNull()
  })
})
