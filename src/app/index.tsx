import { Redirect } from 'expo-router'
import { sessionStore } from '@/shared/auth/session-store'

/**
 * Root index — redirects to appropriate group based on session status.
 * SessionProvider also handles ongoing redirects; this handles the initial load.
 */
export default function Index() {
  const status = sessionStore((s) => s.status)

  if (status === 'booting') return null

  if (status === 'authenticated') {
    return <Redirect href="/(protected)/(tabs)" />
  }

  return <Redirect href="/(public)/sign-in" />
}
