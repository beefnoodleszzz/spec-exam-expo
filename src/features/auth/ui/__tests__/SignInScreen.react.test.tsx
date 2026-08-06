/**
 * React component tests for SignInScreen.
 *
 * Tests: renders, user interaction, SMS send, login flow, errors, loading.
 */

import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'
import { SignInScreen } from '../SignInScreen'

import { authService } from '@/features/auth/auth.container'

// Mock auth container to control authService
jest.mock('@/features/auth/auth.container', () => ({
  authService: {
    sendShortMessage: jest.fn(),
    loginWithShortMessage: jest.fn(),
  },
}))

// Mock individual shared component modules
// AppScreen — wraps with SafeAreaView+ScrollView
jest.mock('@/shared/components/layout/AppScreen', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReact = require('react')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ScrollView } = require('react-native')
  return {
    AppScreen: ({ children }: { children: mockReact.ReactNode }) =>
      mockReact.createElement(ScrollView, { testID: 'screen' }, children),
  }
})

// AppText
jest.mock('@/shared/components/primitives/AppText', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReact = require('react')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require('react-native')
  return {
    AppText: ({
      children,
      accessibilityRole,
    }: {
      children: mockReact.ReactNode
      accessibilityRole?: string
    }) => mockReact.createElement(Text, { accessibilityRole }, children),
  }
})

// AppInput
jest.mock('@/shared/components/forms/AppInput', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReact = require('react')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, TextInput } = require('react-native')
  return {
    AppInput: ({
      placeholder,
      value,
      onChangeText,
      disabled,
      accessibilityLabel,
    }: {
      placeholder?: string
      value?: string
      onChangeText?: (t: string) => void
      disabled?: boolean
      accessibilityLabel?: string
    }) =>
      mockReact.createElement(
        View,
        null,
        mockReact.createElement(TextInput, {
          placeholder,
          value,
          onChangeText,
          editable: !disabled,
          accessibilityLabel,
          testID: accessibilityLabel,
        }),
      ),
  }
})

// AppButton
jest.mock('@/shared/components/actions/AppButton', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReact = require('react')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TouchableOpacity, Text } = require('react-native')
  return {
    AppButton: ({
      children,
      onPress,
      disabled,
      loading,
      accessibilityLabel,
    }: {
      children: mockReact.ReactNode
      onPress?: () => void
      disabled?: boolean
      loading?: boolean
      accessibilityLabel?: string
    }) =>
      mockReact.createElement(
        TouchableOpacity,
        {
          onPress,
          disabled: disabled ?? loading,
          testID: accessibilityLabel,
        },
        mockReact.createElement(
          Text,
          null,
          loading ? '加载中' : children,
        ),
      ),
  }
})

// AppCheckbox
jest.mock('@/shared/components/forms/AppCheckbox', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReact = require('react')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TouchableOpacity, Text } = require('react-native')
  return {
    AppCheckbox: ({
      checked,
      onChange,
      label,
    }: {
      checked: boolean
      onChange: (v: boolean) => void
      label?: string
    }) =>
      mockReact.createElement(
        TouchableOpacity,
        {
          onPress: () => onChange(!checked),
          testID: '用户协议',
        },
        mockReact.createElement(Text, null, label),
      ),
  }
})

describe('SignInScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(authService.sendShortMessage as jest.Mock).mockResolvedValue({ requestId: 'req-test-123' })
    ;(authService.loginWithShortMessage as jest.Mock).mockResolvedValue(undefined)
  })

  it('renders phone input', () => {
    const { getByTestId } = render(<SignInScreen />)
    expect(getByTestId('手机号输入框')).toBeTruthy()
  })

  it('renders code input', () => {
    const { getByTestId } = render(<SignInScreen />)
    expect(getByTestId('验证码输入框')).toBeTruthy()
  })

  it('renders send code button', () => {
    const { getByTestId } = render(<SignInScreen />)
    expect(getByTestId('发送验证码')).toBeTruthy()
  })

  it('renders login button', () => {
    const { getByTestId } = render(<SignInScreen />)
    expect(getByTestId('登录按钮')).toBeTruthy()
  })

  it('renders agreement checkbox', () => {
    const { getByTestId } = render(<SignInScreen />)
    expect(getByTestId('用户协议')).toBeTruthy()
  })

  it('shows error when sending code with invalid phone', async () => {
    const { getByTestId, findByText } = render(<SignInScreen />)
    await act(async () => {
      fireEvent.press(getByTestId('发送验证码'))
    })
    expect(await findByText('请输入正确的手机号')).toBeTruthy()
  })

  it('sends SMS code when phone is valid', async () => {
    const { getByTestId } = render(<SignInScreen />)
    fireEvent.changeText(getByTestId('手机号输入框'), '13812340000')
    await act(async () => {
      fireEvent.press(getByTestId('发送验证码'))
    })
    await waitFor(() => {
      expect(authService.sendShortMessage).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '13812340000' }),
        expect.anything(),
      )
    })
  })

  it('shows error when login tapped with no requestId', async () => {
    const { getByTestId, findByText } = render(<SignInScreen />)
    fireEvent.changeText(getByTestId('手机号输入框'), '13812340000')
    fireEvent.changeText(getByTestId('验证码输入框'), '123456')
    await act(async () => {
      fireEvent.press(getByTestId('登录按钮'))
    })
    expect(await findByText('请先获取验证码')).toBeTruthy()
  })

  it('calls loginWithShortMessage after completing full form', async () => {
    const { getByTestId } = render(<SignInScreen />)

    // Enter phone
    fireEvent.changeText(getByTestId('手机号输入框'), '13812340000')

    // Send code
    await act(async () => {
      fireEvent.press(getByTestId('发送验证码'))
    })
    await waitFor(() => expect(authService.sendShortMessage).toHaveBeenCalled())

    // Enter code
    fireEvent.changeText(getByTestId('验证码输入框'), '123456')

    // Accept agreement
    fireEvent.press(getByTestId('用户协议'))

    // Login
    await act(async () => {
      fireEvent.press(getByTestId('登录按钮'))
    })

    await waitFor(() => {
      expect(authService.loginWithShortMessage).toHaveBeenCalled()
    })
  })
})
