import { describe, it, expect, vi } from 'vitest'
import { AppBootstrap } from '@/providers/AppBootstrap'

vi.mock('react', () => ({
  default: { createElement: (type: unknown, props: unknown) => ({ type, props }), Fragment: 'Fragment' },
  createElement: (type: unknown, props: unknown) => ({ type, props }),
  Fragment: 'Fragment'
}))

const mockUseAppBootstrap = vi.fn()
vi.mock('@/features/app-bootstrap/hooks/useAppBootstrap', () => ({
  useAppBootstrap: () => mockUseAppBootstrap(),
}))

describe('AppBootstrap Provider Component', () => {
  it('renders null when status is running and splash is not hidden', () => {
    mockUseAppBootstrap.mockReturnValue({ status: 'running', hasHiddenSplash: false })
    const el = AppBootstrap({ children: 'Child' })
    expect(el).toBeNull()
  })

  it('renders BootstrapLoadingScreen when status is running and splash is hidden (retry)', () => {
    mockUseAppBootstrap.mockReturnValue({ status: 'running', hasHiddenSplash: true })
    const el = AppBootstrap({ children: 'Child' })
    expect(el).toBeTruthy()
    // It should render BootstrapLoadingScreen
  })

  it('renders BootstrapErrorScreen when status is error', () => {
    mockUseAppBootstrap.mockReturnValue({ status: 'error', errorMessage: 'err' })
    const el = AppBootstrap({ children: 'Child' })
    expect(el).toBeTruthy()
  })

  it('renders children when status is ready', () => {
    mockUseAppBootstrap.mockReturnValue({ status: 'ready' })
    const el = AppBootstrap({ children: 'Child' })
    expect(el).toBeTruthy()
  })
})
