import React from 'react'
import {
  useAppBootstrap,
  BootstrapErrorScreen,
  BootstrapLoadingScreen,
} from '@/features/app-bootstrap'

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
