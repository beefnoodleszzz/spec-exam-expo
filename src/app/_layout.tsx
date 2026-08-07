import '../../global.css';

import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { AppProviders } from '@/providers/AppProviders'
import { AppBootstrap } from '@/providers/AppBootstrap'

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  return (
    <AppProviders>
      <AppBootstrap>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(public)" />
          <Stack.Screen name="(protected)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </AppBootstrap>
    </AppProviders>
  )
}
