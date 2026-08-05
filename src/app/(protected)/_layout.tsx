import { Stack } from 'expo-router'
import { sessionStore } from '@/shared/auth/session-store'
import { Redirect } from 'expo-router'

/**
 * Protected group layout — requires authentication.
 * SessionProvider handles the actual redirect; this is the Expo Router guard.
 */
export default function ProtectedLayout() {
  const status = sessionStore((s) => s.status)

  if (status === 'booting') return null

  if (status === 'anonymous') {
    return <Redirect href="/(public)/sign-in" />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="exam-profile" />
      <Stack.Screen name="practice" />
      <Stack.Screen name="simulation" />
      <Stack.Screen name="questions" />
      <Stack.Screen name="membership" />
      <Stack.Screen name="invitation" />
      <Stack.Screen name="wallet" />
      <Stack.Screen name="account" />
      <Stack.Screen name="settings" />
    </Stack>
  )
}
