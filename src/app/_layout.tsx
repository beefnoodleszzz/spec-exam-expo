import { Stack } from 'expo-router'
import { useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { AppProviders } from '@/providers/AppProviders'
import { AppBootstrap, SessionProvider } from '@/providers/SessionProvider'

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  useEffect(() => {
    // Hide splash once providers have mounted and fonts are ready
    void SplashScreen.hideAsync()
  }, [])

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
