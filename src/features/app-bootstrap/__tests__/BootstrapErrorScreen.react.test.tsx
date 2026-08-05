import React from 'react'
import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native'

import { BootstrapErrorScreen } from '../components/BootstrapErrorScreen'

describe('BootstrapErrorScreen', () => {
  it('renders stable product copy', () => {
    render(
      <BootstrapErrorScreen
        message="应用初始化失败，请重新尝试"
        onRetry={jest.fn()}
      />,
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

  it('uses fallback copy when message is absent', () => {
    render(
      <BootstrapErrorScreen
        message={null}
        onRetry={jest.fn()}
      />,
    )

    expect(
      screen.getByText(
        '加载本地配置异常，请尝试重新打开应用',
      ),
    ).toBeTruthy()
  })

  it('calls retry callback once', () => {
    const onRetry = jest.fn()

    render(
      <BootstrapErrorScreen
        message="应用初始化失败，请重新尝试"
        onRetry={onRetry}
      />,
    )

    fireEvent.press(
      screen.getByText('重新加载'),
    )

    expect(onRetry)
      .toHaveBeenCalledTimes(1)
  })

  it('does not expose raw native errors', () => {
    render(
      <BootstrapErrorScreen
        message="应用初始化失败，请重新尝试"
        onRetry={jest.fn()}
      />,
    )

    expect(
      screen.queryByText(
        /SecureStore|AsyncStorage|native module/i,
      ),
    ).toBeNull()
  })
})
