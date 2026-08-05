import React, { useEffect, useState, useCallback } from 'react'
import { View } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'

import { sessionStore } from '@/shared/auth/session-store'
import { appStore } from '@/shared/auth/app-store'
import { registerUnauthorizedHandler } from '@/shared/auth/session-service'
import { AppText } from '@/shared/components/primitives/AppText'
import { AppButton } from '@/shared/components/actions/AppButton'
import { AppIcon } from '@/shared/components/primitives/AppIcon'

/**
 * SessionProvider — observes session status for reactive route state.
 * Primary route gating is handled by layout-level guards in (public)/_layout.tsx and (protected)/_layout.tsx.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const status = sessionStore((s) => s.status)

  if (status === 'booting') return null

  return <>{children}</>
}


export type BootstrapStatus = 'idle' | 'running' | 'ready' | 'error'

/**
 * AppBootstrap — manages startup state machine:
 * 'running' -> restores session & profile -> 'ready' -> hides Splash Screen.
 * If failure occurs -> 'error' -> hides Splash Screen & shows BootstrapErrorScreen.
 */
export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const restoreSession = sessionStore((s) => s.restoreSession)
  const restoreExamProfile = appStore((s) => s.restoreExamProfile)
  const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus>('running')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const runBootstrap = useCallback(async () => {
    setBootstrapStatus('running')
    setErrorMessage(null)
    try {
      registerUnauthorizedHandler()
      await Promise.all([restoreSession(), restoreExamProfile()])
      setBootstrapStatus('ready')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '初始化失败，请稍后重试'
      setErrorMessage(msg)
      setBootstrapStatus('error')
    } finally {
      await SplashScreen.hideAsync().catch(() => {})
    }
  }, [restoreSession, restoreExamProfile])

  useEffect(() => {
    void runBootstrap()
  }, [runBootstrap])

  if (bootstrapStatus === 'error') {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-background">
        <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
          <AppIcon name="alert-circle-outline" size={36} color="#F53F3F" />
        </View>
        <AppText variant="heading" tone="danger" align="center">
          应用启动失败
        </AppText>
        <AppText variant="body-secondary" tone="muted" align="center" className="mt-2 mb-6 max-w-xs">
          {errorMessage || '加载本地配置异常，请试重新打开应用'}
        </AppText>
        <AppButton variant="primary" size="md" onPress={() => void runBootstrap()}>
          重新加载
        </AppButton>
      </View>
    )
  }

  // Still running — return null while native Splash Screen covers the viewport
  if (bootstrapStatus !== 'ready') {
    return null
  }

  return <>{children}</>
}
