import React from 'react'
import { sessionStore } from '@/shared/auth/session-store'
import {
  useAppBootstrap,
  BootstrapErrorScreen,
  BootstrapLoadingScreen,
} from '@/features/app-bootstrap'

/**
 * SessionProvider — observes session status for reactive route state.
 * Primary route gating is handled by layout-level guards in (public)/_layout.tsx and (protected)/_layout.tsx.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const status = sessionStore((s) => s.status)

  if (status === 'booting') return null

  return <>{children}</>
}

/**
 * AppBootstrap — manages startup state machine via useAppBootstrap feature hook.
 * Avoids white screen during retry by checking hasHiddenSplash state.
 */
export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const { status, errorMessage, hasHiddenSplash, retry } = useAppBootstrap()

  if (status === 'error') {
    return <BootstrapErrorScreen message={errorMessage} onRetry={retry} />
  }

  if (status === 'running') {
    // On first startup, return null so Native Splash Screen covers viewport
    if (!hasHiddenSplash) {
      return null
    }
    // On retry startup (after Splash has already been hidden), show React Loading Screen
    return <BootstrapLoadingScreen />
  }

  return <>{children}</>
}
