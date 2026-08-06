import { Stack, Redirect, useSegments } from 'expo-router'
import { sessionStore } from '@/shared/auth/session-store'
import { appStore } from '@/shared/auth/app-store'

/**
 * Protected group layout — requires authentication.
 * Layout-level auth guard redirects anonymous users to sign-in.
 */
export default function ProtectedLayout() {
  const status = sessionStore((s) => s.status)
  const currentExamProfile = appStore((s) => s.currentExamProfile)
  const segments = useSegments()

  if (status === 'booting') {
    return null
  }

  if (status !== 'authenticated') {
    return <Redirect href="/(public)/sign-in" />
  }

  const inExamProfile = (segments as string[])[1] === 'exam-profile'

  if (!currentExamProfile && !inExamProfile) {
    return <Redirect href="/(protected)/exam-profile" />
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
