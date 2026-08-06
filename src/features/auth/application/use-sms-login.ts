/**
 * SMS login state and actions.
 *
 * Manages phone input, verification code, countdown timer, and login flow.
 */

import { useReducer, useEffect, useRef } from 'react'
import type { AuthService } from './auth.service'

interface SmsLoginState {
  phone: string
  verificationCode: string
  requestId: string | null

  countdown: number
  isSendingCode: boolean
  isLoggingIn: boolean

  sendCodeError: Error | null
  loginError: Error | null
}

type SmsLoginAction =
  | {
      type: 'SET_PHONE'
      payload: string
    }
  | {
      type: 'SET_CODE'
      payload: string
    }
  | {
      type: 'SET_REQUEST_ID'
      payload: string | null
    }
  | {
      type: 'SEND_CODE_START'
    }
  | {
      type: 'SEND_CODE_SUCCESS'
      payload: string
    }
  | {
      type: 'SEND_CODE_ERROR'
      payload: Error | null
    }
  | {
      type: 'COUNTDOWN'
    }
  | {
      type: 'LOGIN_START'
    }
  | {
      type: 'LOGIN_SUCCESS'
    }
  | {
      type: 'LOGIN_ERROR'
      payload: Error | null
    }
  | {
      type: 'RESET'
    }

const initialState: SmsLoginState = {
  phone: '',
  verificationCode: '',
  requestId: null,

  countdown: 60,
  isSendingCode: false,
  isLoggingIn: false,

  sendCodeError: null,
  loginError: null,
}

function reducer(
  state: SmsLoginState,
  action: SmsLoginAction,
): SmsLoginState {
  switch (action.type) {
    case 'SET_PHONE':
      return {
        ...state,
        phone: action.payload.slice(0, 11),
      }
    case 'SET_CODE':
      return {
        ...state,
        verificationCode: action.payload,
      }
    case 'SET_REQUEST_ID':
      return {
        ...state,
        requestId: action.payload,
      }
    case 'SEND_CODE_START':
      return {
        ...state,
        isSendingCode: true,
        sendCodeError: null,
      }
    case 'SEND_CODE_SUCCESS':
      return {
        ...state,
        isSendingCode: false,
        requestId: action.payload,
        countdown: 60,
      }
    case 'SEND_CODE_ERROR':
      return {
        ...state,
        isSendingCode: false,
        sendCodeError: action.payload,
      }
    case 'COUNTDOWN':
      return {
        ...state,
        countdown: Math.max(0, state.countdown - 1),
      }
    case 'LOGIN_START':
      return {
        ...state,
        isLoggingIn: true,
        loginError: null,
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoggingIn: false,
      }
    case 'LOGIN_ERROR':
      return {
        ...state,
        isLoggingIn: false,
        loginError: action.payload,
      }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export interface UseSmsLoginOptions {
  authService: AuthService
  examContext?: {
    province?: string
    provinceCode?: string
    examTypeId?: string
    inviteCode?: string
  }
}

export function useSmsLogin(
  options: UseSmsLoginOptions,
) {
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
  )
  const timerRef = useRef<
    ReturnType<typeof setInterval> | null
  >(null)
  const abortControllerRef = useRef<
    AbortController | null
  >(null)

  const PHONE_REGEX = /^1[3-9]\d{9}$/

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      abortControllerRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    if (state.countdown <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [state.countdown])

  const sendCode = async () => {
    if (!PHONE_REGEX.test(state.phone)) {
      dispatch({
        type: 'SEND_CODE_ERROR',
        payload: new Error(
          'Please enter a valid phone number',
        ),
      })
      return
    }

    if (state.countdown < 60 && state.countdown > 0) {
      return
    }

    dispatch({ type: 'SEND_CODE_START' })
    abortControllerRef.current = new AbortController()

    try {
      const result =
        await options.authService.sendShortMessage(
          { phone: state.phone },
          abortControllerRef.current.signal,
        )

      dispatch({
        type: 'SEND_CODE_SUCCESS',
        payload: result.requestId,
      })

      timerRef.current = setInterval(() => {
        dispatch({ type: 'COUNTDOWN' })
      }, 1000)
    } catch (error) {
      dispatch({
        type: 'SEND_CODE_ERROR',
        payload:
          error instanceof Error
            ? error
            : new Error('Failed to send code'),
      })
    }
  }

  const login = async () => {
    if (!PHONE_REGEX.test(state.phone)) {
      dispatch({
        type: 'LOGIN_ERROR',
        payload: new Error(
          'Please enter a valid phone number',
        ),
      })
      return
    }

    if (!state.verificationCode.trim()) {
      dispatch({
        type: 'LOGIN_ERROR',
        payload: new Error('Please enter the code'),
      })
      return
    }

    if (!state.requestId) {
      dispatch({
        type: 'LOGIN_ERROR',
        payload: new Error(
          'Request ID missing. Please send code again.',
        ),
      })
      return
    }

    dispatch({ type: 'LOGIN_START' })
    abortControllerRef.current = new AbortController()

    try {
      await options.authService.loginWithShortMessage(
        {
          phone: state.phone,
          verificationCode:
            state.verificationCode,
          requestId: state.requestId,
          ...options.examContext,
        },
        abortControllerRef.current.signal,
      )

      dispatch({ type: 'LOGIN_SUCCESS' })
      dispatch({ type: 'RESET' })
    } catch (error) {
      dispatch({
        type: 'LOGIN_ERROR',
        payload:
          error instanceof Error
            ? error
            : new Error('Login failed'),
      })
    }
  }

  const clearError = () => {
    if (state.sendCodeError) {
      dispatch({
        type: 'SEND_CODE_ERROR',
        payload: null,
      })
    }
    if (state.loginError) {
      dispatch({
        type: 'LOGIN_ERROR',
        payload: null,
      })
    }
  }

  return {
    state,
    sendCode,
    login,
    clearError,
    setPhone: (phone: string) =>
      dispatch({
        type: 'SET_PHONE',
        payload: phone,
      }),
    setCode: (code: string) =>
      dispatch({
        type: 'SET_CODE',
        payload: code,
      }),
  }
}
