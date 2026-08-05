import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { AppProviders } from '@/providers/AppProviders'
import { AppBootstrap, SessionProvider } from '@/providers/SessionProvider'

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  return (
    <AppProviders>
      <AppBootstrap>
        <SessionProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(public)" />
            <Stack.Screen name="(protected)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </SessionProvider>
      </AppBootstrap>
    </AppProviders>
  )
}
