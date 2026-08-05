import { Stack } from 'expo-router'

/**
 * Public group layout — accessible without authentication.
 * Screens: privacy, onboarding, sign-in, sms-login, one-click-login.
 */
export default function PublicLayout() {
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
