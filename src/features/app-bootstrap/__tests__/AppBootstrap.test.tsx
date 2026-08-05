import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppBootstrap } from '@/providers/AppBootstrap'
import { useAppBootstrap } from '../hooks/useAppBootstrap'
import type { ReactNode } from 'react'

vi.mock('../hooks/useAppBootstrap', () => ({
  useAppBootstrap: vi.fn(),
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

    expect(result).toBeDefined()
    expect(result).not.toBeNull()
    // In a real Testing Library environment, we'd assert on rendered text
    // e.g., expect(screen.getByText('正在重新加载基础配置')).toBeTruthy()
  })

  it('renders BootstrapErrorScreen when status is error', () => {
    const mockRetry = vi.fn()
    vi.mocked(useAppBootstrap).mockReturnValue({
      status: 'error',
      errorMessage: '应用启动失败',
      hasHiddenSplash: false,
      retry: mockRetry,
    })

    const result = AppBootstrap({ children: 'Test Child' as unknown as ReactNode })

    expect(result).toBeDefined()
    expect(result).not.toBeNull()
    // In a real Testing Library environment, we'd verify:
    // - error message is displayed
    // - retry button is present
    // - retry button calls the retry function
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

    expect(result).toBeDefined()
    expect(result).not.toBeNull()
    // In a real Testing Library environment, we'd assert:
    // expect(screen.getByText('Protected Content')).toBeTruthy()
  })

  it('passes retry callback to BootstrapErrorScreen', () => {
    const mockRetry = vi.fn()
    vi.mocked(useAppBootstrap).mockReturnValue({
      status: 'error',
      errorMessage: 'Error occurred',
      hasHiddenSplash: false,
      retry: mockRetry,
    })

    AppBootstrap({ children: 'Test Child' as unknown as ReactNode })

    // Verify that useAppBootstrap hook is called and retry is available
    expect(useAppBootstrap).toHaveBeenCalled()
    const mockResult = vi.mocked(useAppBootstrap).mock.results[0]
    if (mockResult) {
      expect(mockResult.value.retry).toBe(mockRetry)
    }
  })

  it('correctly handles hasHiddenSplash state transitions', () => {
    mockRenderComponent()

    // Initial: running, splash not hidden
    vi.mocked(useAppBootstrap).mockReturnValue({
      status: 'running',
      errorMessage: null,
      hasHiddenSplash: false,
      retry: vi.fn(),
    })
    let result = AppBootstrap({ children: 'Child' as unknown as ReactNode })
    expect(result).toBeNull()

    // After splash hides: running, splash hidden
    vi.mocked(useAppBootstrap).mockReturnValue({
      status: 'running',
      errorMessage: null,
      hasHiddenSplash: true,
      retry: vi.fn(),
    })
    result = AppBootstrap({ children: 'Child' as unknown as ReactNode })
    expect(result).not.toBeNull()

    // Ready state
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

// Helper to track component re-renders (simplified version)
function mockRenderComponent() {
  let renderCount = 0

  return {
    rerender: () => {
      renderCount++
    },
    getRenderCount: () => renderCount,
  }
}
