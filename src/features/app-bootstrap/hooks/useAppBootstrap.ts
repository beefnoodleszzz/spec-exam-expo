import { useState, useEffect, useCallback, useRef } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { sessionStore } from '@/shared/auth/session-store'
import { appStore } from '@/shared/auth/app-store'
import { registerUnauthorizedHandler } from '@/shared/auth/session-service'
import { logger, sanitizeError } from '@/shared/logging/logger'

export type BootstrapStatus = 'running' | 'ready' | 'error'

export function useAppBootstrap() {
  const restoreSession = sessionStore((s) => s.restoreSession)
  const restoreExamProfile = appStore((s) => s.restoreExamProfile)
  const [status, setStatus] = useState<BootstrapStatus>('running')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasHiddenSplash, setHasHiddenSplash] = useState(false)

  const hasHiddenSplashRef = useRef(false)
  const bootstrapPromiseRef = useRef<Promise<void> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const hideSplashOnce = useCallback(async () => {
    if (hasHiddenSplashRef.current) return
    try {
      await SplashScreen.hideAsync()
      hasHiddenSplashRef.current = true
      if (mountedRef.current) {
        setHasHiddenSplash(true)
      }
    } catch (error) {
      logger.warn('splash_hide_failed', { error: sanitizeError(error) })
      throw error
    }
  }, [])

  const performBootstrap = useCallback(async () => {
    if (mountedRef.current) {
      setStatus('running')
      setErrorMessage(null)
    }

    try {
      registerUnauthorizedHandler()
      await Promise.all([restoreSession(), restoreExamProfile()])

      await hideSplashOnce()

      if (mountedRef.current) {
        setStatus('ready')
      }
    } catch (err: unknown) {
      logger.error('app_bootstrap_failed', { error: sanitizeError(err) })
      if (mountedRef.current) {
        setErrorMessage('应用初始化失败，请重新尝试')
        setStatus('error')
      }
    }
  }, [restoreSession, restoreExamProfile, hideSplashOnce])

  const runBootstrap = useCallback(() => {
    if (bootstrapPromiseRef.current) {
      return bootstrapPromiseRef.current
    }

    bootstrapPromiseRef.current = performBootstrap().finally(() => {
      bootstrapPromiseRef.current = null
    })

    return bootstrapPromiseRef.current
  }, [performBootstrap])

  useEffect(() => {
    void runBootstrap()
  }, [runBootstrap])

  return {
    status,
    errorMessage,
    hasHiddenSplash,
    retry: runBootstrap,
  }
}
