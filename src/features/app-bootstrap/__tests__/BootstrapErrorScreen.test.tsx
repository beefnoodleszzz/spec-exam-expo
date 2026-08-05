import { describe, it, expect, vi } from 'vitest'
import { BootstrapErrorScreen } from '../components/BootstrapErrorScreen'

vi.mock('react', () => ({
  default: { createElement: (type: unknown, props: unknown) => ({ type, props }) },
  createElement: (type: unknown, props: unknown) => ({ type, props }),
}))
vi.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  Platform: { select: (obj: Record<string, unknown>) => obj.default ?? obj.ios, OS: 'ios' }
}))

describe('BootstrapErrorScreen', () => {
  it('renders default error message', () => {
    const el = BootstrapErrorScreen({ onRetry: vi.fn() })
    expect(el).toBeTruthy()
  })

  it('renders custom error message', () => {
    const el = BootstrapErrorScreen({ message: "自定义错误", onRetry: vi.fn() })
    expect(el).toBeTruthy()
  })
})
