import { useState, useEffect, useCallback, useRef } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { sessionStore } from '@/shared/auth/session-store'
import { appStore } from '@/shared/auth/app-store'
import { registerUnauthorizedHandler } from '@/shared/auth/session-service'
import { logger } from '@/shared/logging/logger'

export type BootstrapStatus = 'running' | 'ready' | 'error'

export function useAppBootstrap() {
  const restoreSession = sessionStore((s) => s.restoreSession)
  const restoreExamProfile = appStore((s) => s.restoreExamProfile)
  const [status, setStatus] = useState<BootstrapStatus>('running')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
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
    } catch (error) {
      logger.warn('splash_hide_failed', { error })
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
      if (mountedRef.current) {
        setStatus('ready')
      }
    } catch (err: unknown) {
      logger.error('app_bootstrap_failed', err)
      if (mountedRef.current) {
        setErrorMessage('本地配置加载失败，请重新尝试')
        setStatus('error')
      }
    } finally {
      await hideSplashOnce().catch(() => {})
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
    hasHiddenSplash: hasHiddenSplashRef.current,
    retry: runBootstrap,
  }
}
