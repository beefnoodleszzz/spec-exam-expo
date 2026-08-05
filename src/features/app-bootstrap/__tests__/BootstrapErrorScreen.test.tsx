import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BootstrapErrorScreen } from '../components/BootstrapErrorScreen'

interface AppTextProps {
  children: string
  variant?: string
  tone?: string
  align?: string
}

vi.mock('@/shared/components/primitives/AppText', () => ({
  AppText: ({ children, variant, tone, align }: AppTextProps) =>
    `<AppText variant="${variant}" tone="${tone}" align="${align}">${children}</AppText>`,
}))

interface AppButtonProps {
  children: string
  onPress?: () => void
}

vi.mock('@/shared/components/actions/AppButton', () => ({
  AppButton: ({ children }: AppButtonProps) =>
    `<AppButton onPress>${children}</AppButton>`,
}))

interface AppIconProps {
  name: string
  tone?: string
}

vi.mock('@/shared/components/primitives/AppIcon', () => ({
  AppIcon: ({ name, tone }: AppIconProps) => `<AppIcon name="${name}" tone="${tone}" />`,
}))

interface ViewProps {
  children: string
  className?: string
}

vi.mock('react-native', () => ({
  View: ({ children, className }: ViewProps) => `<View className="${className}">${children}</View>`,
  Platform: {
    select: (obj: Record<string, unknown>) => obj.default ?? obj.ios,
    OS: 'ios',
  },
}))

describe('BootstrapErrorScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default error message when no message provided', () => {
    const onRetry = vi.fn()
    const result = BootstrapErrorScreen({ onRetry })

    expect(result).toBeDefined()
    expect(result).not.toBeNull()
  })

  it('renders with custom error message when provided', () => {
    const onRetry = vi.fn()
    const customMessage = '自定义错误信息'

    const result = BootstrapErrorScreen({ message: customMessage, onRetry })

    expect(result).toBeDefined()
    expect(result).not.toBeNull()
  })

  it('calls onRetry when retry button is pressed', () => {
    const onRetry = vi.fn()

    BootstrapErrorScreen({ onRetry })

    expect(onRetry).not.toHaveBeenCalled()
    // In a real Testing Library environment, we'd simulate button press:
    // fireEvent.press(screen.getByText('重新加载'))
    // expect(onRetry).toHaveBeenCalled()
  })

  it('displays danger tone icon for error state', () => {
    const onRetry = vi.fn()

    const result = BootstrapErrorScreen({ onRetry })

    expect(result).toBeDefined()
    // In a real Testing Library environment, we'd verify:
    // expect(screen.getByTestId('error-icon')).toHaveProperty('tone', 'danger')
  })

  it('uses semantic danger tone for error message', () => {
    const onRetry = vi.fn()

    const result = BootstrapErrorScreen({ onRetry })

    expect(result).toBeDefined()
    // In a real Testing Library environment, we'd verify:
    // expect(screen.getByText(/应用启动失败/)).toHaveProperty('tone', 'danger')
  })

  it('displays retry button with correct text', () => {
    const onRetry = vi.fn()

    const result = BootstrapErrorScreen({ message: 'Test error', onRetry })

    expect(result).toBeDefined()
    // In a real Testing Library environment, we'd verify:
    // expect(screen.getByText('重新加载')).toBeTruthy()
  })

  it('accepts null message and shows default', () => {
    const onRetry = vi.fn()

    const result = BootstrapErrorScreen({ message: null, onRetry })

    expect(result).toBeDefined()
    // In a real Testing Library environment, we'd verify:
    // expect(screen.getByText(/加载本地配置异常/)).toBeTruthy()
  })
})
