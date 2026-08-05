import React from 'react'
import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native'
import { Text } from 'react-native'

import { AppBootstrap } from '@/providers/AppBootstrap'
import { useAppBootstrap } from '../hooks/useAppBootstrap'

jest.mock('../hooks/useAppBootstrap', () => ({
  useAppBootstrap: jest.fn(),
}))

const useAppBootstrapMock =
  useAppBootstrap as jest.MockedFunction<
    typeof useAppBootstrap
  >

describe('AppBootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing while native splash is visible', () => {
    useAppBootstrapMock.mockReturnValue({
      status: 'running',
      errorMessage: null,
      hasHiddenSplash: false,
      retry: jest.fn(),
    })

    render(
      <AppBootstrap>
        <Text testID="app-content">
          Protected Content
        </Text>
      </AppBootstrap>,
    )

    expect(
      screen.queryByTestId('app-content'),
    ).toBeNull()

    expect(
      screen.queryByText(
        '正在重新加载基础配置...',
      ),
    ).toBeNull()
  })

  it('renders React loading screen during retry', () => {
    useAppBootstrapMock.mockReturnValue({
      status: 'running',
      errorMessage: null,
      hasHiddenSplash: true,
      retry: jest.fn(),
    })

    render(
      <AppBootstrap>
        <Text testID="app-content">
          Protected Content
        </Text>
      </AppBootstrap>,
    )

    expect(
      screen.getByText(
        '正在重新加载基础配置...',
      ),
    ).toBeTruthy()

    expect(
      screen.queryByTestId('app-content'),
    ).toBeNull()
  })

  it('renders bootstrap error screen', () => {
    useAppBootstrapMock.mockReturnValue({
      status: 'error',
      errorMessage:
        '应用初始化失败，请重新尝试',
      hasHiddenSplash: false,
      retry: jest.fn(),
    })

    render(
      <AppBootstrap>
        <Text testID="app-content">
          Protected Content
        </Text>
      </AppBootstrap>,
    )

    expect(
      screen.getByText('应用启动失败'),
    ).toBeTruthy()

    expect(
      screen.getByText(
        '应用初始化失败，请重新尝试',
      ),
    ).toBeTruthy()

    expect(
      screen.getByText('重新加载'),
    ).toBeTruthy()
  })

  it('calls retry when retry button is pressed', () => {
    const retry = jest.fn()

    useAppBootstrapMock.mockReturnValue({
      status: 'error',
      errorMessage:
        '应用初始化失败，请重新尝试',
      hasHiddenSplash: false,
      retry,
    })

    render(
      <AppBootstrap>
        <Text testID="app-content">
          Protected Content
        </Text>
      </AppBootstrap>,
    )

    fireEvent.press(
      screen.getByText('重新加载'),
    )

    expect(retry)
      .toHaveBeenCalledTimes(1)
  })

  it('renders children only when ready', () => {
    useAppBootstrapMock.mockReturnValue({
      status: 'ready',
      errorMessage: null,
      hasHiddenSplash: true,
      retry: jest.fn(),
    })

    render(
      <AppBootstrap>
        <Text testID="app-content">
          Protected Content
        </Text>
      </AppBootstrap>,
    )

    expect(
      screen.getByTestId('app-content'),
    ).toBeTruthy()

    expect(
      screen.queryByText('应用启动失败'),
    ).toBeNull()

    expect(
      screen.queryByText(
        '正在重新加载基础配置...',
      ),
    ).toBeNull()
  })
})
