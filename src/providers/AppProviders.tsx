import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryProvider } from './QueryProvider'
import { ToastProvider } from '@/shared/components/feedback/AppToast'

/**
 * AppProviders — root provider tree.
 * Order matters: GestureHandler > SafeArea > QueryProvider > ToastProvider.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
