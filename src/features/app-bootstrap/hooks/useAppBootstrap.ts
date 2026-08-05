import { useState, useEffect, useCallback, useRef } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { sessionStore } from '@/shared/auth/session-store'
import { appStore } from '@/shared/auth/app-store'
import { registerUnauthorizedHandler } from '@/shared/auth/session-service'

export type BootstrapStatus = 'running' | 'ready' | 'error'

export function useAppBootstrap() {
  const restoreSession = sessionStore((s) => s.restoreSession)
  const restoreExamProfile = appStore((s) => s.restoreExamProfile)
  const [status, setStatus] = useState<BootstrapStatus>('running')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const hasHiddenSplashRef = useRef(false)

  const hideSplashOnce = useCallback(async () => {
    if (!hasHiddenSplashRef.current) {
      hasHiddenSplashRef.current = true
      await SplashScreen.hideAsync().catch(() => {})
    }
  }, [])

  const runBootstrap = useCallback(async () => {
    setStatus('running')
    setErrorMessage(null)
    try {
      registerUnauthorizedHandler()
      await Promise.all([restoreSession(), restoreExamProfile()])
      setStatus('ready')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '初始化失败，请稍后重试'
      setErrorMessage(msg)
      setStatus('error')
    } finally {
      await hideSplashOnce()
    }
  }, [restoreSession, restoreExamProfile, hideSplashOnce])

  useEffect(() => {
    void runBootstrap()
  }, [runBootstrap])

  return {
    status,
    errorMessage,
    hasHiddenSplash: hasHiddenSplashRef.current,
    retry: runBootstrap,
  }
}
