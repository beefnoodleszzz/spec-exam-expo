import { act, renderHook, waitFor } from '@testing-library/react-native'
import * as SplashScreen from 'expo-splash-screen'

import { useAppBootstrap } from '../hooks/useAppBootstrap'
import { sessionStore } from '@/shared/auth/session-store'
import { appStore } from '@/shared/auth/app-store'
import { logger } from '@/shared/logging/logger'


jest.mock('@/shared/logging/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },

  sanitizeError: jest.fn((error: unknown) => {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
      }
    }

    return {
      message: 'Unknown error',
    }
  }),
}))

describe('useAppBootstrap', () => {
  const hideAsyncMock =
    SplashScreen.hideAsync as jest.MockedFunction<
      typeof SplashScreen.hideAsync
    >

  beforeEach(() => {
    jest.clearAllMocks()

    sessionStore.setState({
      status: 'booting',
      accessToken: null,
      userId: null,
    })

    appStore.setState({
      currentExamProfile: null,
    })
  })

  it('starts automatically and restores session and exam profile', async () => {
    const restoreSession = jest
      .spyOn(sessionStore.getState(), 'restoreSession')
      .mockResolvedValue(undefined)

    const restoreExamProfile = jest
      .spyOn(appStore.getState(), 'restoreExamProfile')
      .mockResolvedValue(undefined)

    hideAsyncMock.mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useAppBootstrap(),
    )

    expect(result.current.status).toBe('running')

    await waitFor(() => {
      expect(restoreSession)
        .toHaveBeenCalledTimes(1)

      expect(restoreExamProfile)
        .toHaveBeenCalledTimes(1)
    })
  })

  it('enters ready only after restore and splash hide succeed', async () => {
    jest
      .spyOn(sessionStore.getState(), 'restoreSession')
      .mockResolvedValue(undefined)

    jest
      .spyOn(appStore.getState(), 'restoreExamProfile')
      .mockResolvedValue(undefined)

    hideAsyncMock.mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useAppBootstrap(),
    )

    await waitFor(() => {
      expect(result.current.status)
        .toBe('ready')
    })

    expect(result.current.hasHiddenSplash)
      .toBe(true)

    expect(result.current.errorMessage)
      .toBeNull()

    expect(hideAsyncMock)
      .toHaveBeenCalledTimes(1)
  })

  it('enters error when session restore fails', async () => {
    const error = new Error(
      'secure storage internal failure',
    )

    jest
      .spyOn(sessionStore.getState(), 'restoreSession')
      .mockRejectedValue(error)

    jest
      .spyOn(appStore.getState(), 'restoreExamProfile')
      .mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useAppBootstrap(),
    )

    await waitFor(() => {
      expect(result.current.status)
        .toBe('error')
    })

    expect(result.current.errorMessage)
      .toBe('应用初始化失败，请重新尝试')

    expect(result.current.errorMessage)
      .not.toContain('secure storage')

    expect(logger.error)
      .toHaveBeenCalled()
  })

  it('enters error when exam profile restore fails', async () => {
    jest
      .spyOn(sessionStore.getState(), 'restoreSession')
      .mockResolvedValue(undefined)

    jest
      .spyOn(appStore.getState(), 'restoreExamProfile')
      .mockRejectedValue(
        new Error('profile storage failure'),
      )

    const { result } = renderHook(() =>
      useAppBootstrap(),
    )

    await waitFor(() => {
      expect(result.current.status)
        .toBe('error')
    })

    expect(result.current.hasHiddenSplash)
      .toBe(false)

    expect(logger.error)
      .toHaveBeenCalled()
  })

  it('does not enter ready when splash hide fails', async () => {
    jest
      .spyOn(sessionStore.getState(), 'restoreSession')
      .mockResolvedValue(undefined)

    jest
      .spyOn(appStore.getState(), 'restoreExamProfile')
      .mockResolvedValue(undefined)

    hideAsyncMock.mockRejectedValue(
      new Error('native splash failure'),
    )

    const { result } = renderHook(() =>
      useAppBootstrap(),
    )

    await waitFor(() => {
      expect(result.current.status)
        .toBe('error')
    })

    expect(result.current.hasHiddenSplash)
      .toBe(false)

    expect(result.current.status)
      .not.toBe('ready')

    expect(logger.warn)
      .toHaveBeenCalledWith(
        'splash_hide_failed',
        expect.any(Object),
      )

    expect(logger.error)
      .toHaveBeenCalledWith(
        'app_bootstrap_failed',
        expect.any(Object),
      )
  })

  it('retries after failure and enters ready', async () => {
    const restoreSession = jest
      .spyOn(sessionStore.getState(), 'restoreSession')

    restoreSession
      .mockRejectedValueOnce(
        new Error('first attempt failed'),
      )
      .mockResolvedValueOnce(undefined)

    jest
      .spyOn(appStore.getState(), 'restoreExamProfile')
      .mockResolvedValue(undefined)

    hideAsyncMock.mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useAppBootstrap(),
    )

    await waitFor(() => {
      expect(result.current.status)
        .toBe('error')
    })

    await act(async () => {
      await result.current.retry()
    })

    await waitFor(() => {
      expect(result.current.status)
        .toBe('ready')
    })

    expect(restoreSession)
      .toHaveBeenCalledTimes(2)

    expect(result.current.hasHiddenSplash)
      .toBe(true)
  })

  it('returns the same promise for concurrent retry calls', async () => {
    let resolveRestore:
      | (() => void)
      | undefined

    const pendingRestore = new Promise<void>(
      (resolve) => {
        resolveRestore = resolve
      },
    )

    const restoreSession = jest
      .spyOn(sessionStore.getState(), 'restoreSession')
      .mockReturnValue(pendingRestore)

    jest
      .spyOn(appStore.getState(), 'restoreExamProfile')
      .mockResolvedValue(undefined)

    hideAsyncMock.mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useAppBootstrap(),
    )

    await waitFor(() => {
      expect(restoreSession)
        .toHaveBeenCalledTimes(1)
    })

    let promise1: Promise<void>
    let promise2: Promise<void>
    let promise3: Promise<void>

    act(() => {
      promise1 = result.current.retry()
      promise2 = result.current.retry()
      promise3 = result.current.retry()
    })

    expect(promise1!).toBe(promise2!)
    expect(promise2!).toBe(promise3!)

    await act(async () => {
      resolveRestore?.()
      await promise1!
    })

    expect(restoreSession)
      .toHaveBeenCalledTimes(1)
  })

  it('does not update React state after unmount', async () => {
    let resolveRestore:
      | (() => void)
      | undefined

    const pendingRestore = new Promise<void>(
      (resolve) => {
        resolveRestore = resolve
      },
    )

    jest
      .spyOn(sessionStore.getState(), 'restoreSession')
      .mockReturnValue(pendingRestore)

    jest
      .spyOn(appStore.getState(), 'restoreExamProfile')
      .mockResolvedValue(undefined)

    hideAsyncMock.mockResolvedValue(undefined)

    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    const { unmount } = renderHook(() =>
      useAppBootstrap(),
    )

    unmount()

    await act(async () => {
      resolveRestore?.()
      await pendingRestore
    })

    expect(consoleError)
      .not.toHaveBeenCalledWith(
        expect.stringContaining(
          'state update on an unmounted component',
        ),
      )

    consoleError.mockRestore()
  })
})
