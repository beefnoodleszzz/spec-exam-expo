import { Stack, Redirect } from 'expo-router'
import { sessionStore } from '@/shared/auth/session-store'

/**
 * Public group layout — accessible without authentication.
 * Layout-level auth guard redirects authenticated users to protected tabs.
 */
export default function PublicLayout() {
  const status = sessionStore((s) => s.status)

  if (status === 'booting') {
    return null
  }

  if (status === 'authenticated') {
    // @ts-expect-error - Expo router types aren't fully synced yet
    return <Redirect href={'/(protected)'} />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="privacy" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sms-login" />
      <Stack.Screen name="one-click-login" />
    </Stack>
  )
}
