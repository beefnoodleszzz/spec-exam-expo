import React, { useEffect, useCallback, useRef } from 'react'
import { useRouter, useSegments } from 'expo-router'
import { sessionStore } from '@/shared/auth/session-store'
import { appStore } from '@/shared/auth/app-store'

/**
 * SessionProvider — observes session status and drives route protection.
 *
 * Navigation is done HERE, not in the HTTP client or session store.
 * This keeps routing as a UI concern and keeps the data layer clean.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const segments = useSegments()
  const status = sessionStore((s) => s.status)
  const initialized = useRef(false)

  const redirect = useCallback(() => {
    if (status === 'booting') return

    const inPublicGroup = (segments as string[])[0] === '(public)'
    const inProtectedGroup = (segments as string[])[0] === '(protected)'

    if (status === 'anonymous' && inProtectedGroup) {
      router.replace('/(public)/sign-in')
    } else if (status === 'authenticated' && inPublicGroup) {
      router.replace('/(protected)/(tabs)')
    }

    initialized.current = true
  }, [status, segments, router])

  useEffect(() => {
    redirect()
  }, [redirect])

  return <>{children}</>
}

/**
 * AppBootstrap — loads session + exam profile from storage during startup.
 */
export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const restoreSession = sessionStore((s) => s.restoreSession)
  const restoreExamProfile = appStore((s) => s.restoreExamProfile)
  const status = sessionStore((s) => s.status)

  useEffect(() => {
    void Promise.all([restoreSession(), restoreExamProfile()])
  }, [restoreSession, restoreExamProfile])

  // Still booting — show nothing (splash screen handles the visual)
  if (status === 'booting') return null

  return <>{children}</>
}
