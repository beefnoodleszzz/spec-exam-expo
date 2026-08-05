import React from 'react'
import {
  View,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'
import { cn } from '@/shared/utils/cn'

export interface AppScreenProps {
  children: React.ReactNode
  scrollable?: boolean
  keyboardAware?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  safeAreaEdges?: Edge[]
  className?: string
  contentContainerClassName?: string
  statusBarStyle?: 'light' | 'dark'
}

export function AppScreen({
  children,
  scrollable = false,
  keyboardAware = false,
  refreshing = false,
  onRefresh,
  safeAreaEdges = ['top', 'left', 'right'],
  className,
  contentContainerClassName,
  statusBarStyle = 'dark',
}: AppScreenProps) {
  const content = scrollable ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={cn('px-4 py-3', contentContainerClassName)}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View className={cn('flex-1 px-4 py-3', contentContainerClassName)}>
      {children}
    </View>
  )

  const wrappedContent = keyboardAware ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  )

  return (
    <SafeAreaView edges={safeAreaEdges} className={cn('flex-1 bg-background', className)}>
      <StatusBar barStyle={statusBarStyle === 'dark' ? 'dark-content' : 'light-content'} />
      {wrappedContent}
    </SafeAreaView>
  )
}
