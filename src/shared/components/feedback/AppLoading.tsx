import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { AppText } from '../primitives/AppText'
import { cn } from '@/shared/utils/cn'

export interface AppLoadingProps {
  message?: string
  fullScreen?: boolean
  className?: string
}

export function AppLoading({
  message = '加载中...',
  fullScreen = true,
  className,
}: AppLoadingProps) {
  return (
    <View
      className={cn(
        'items-center justify-center p-6',
        fullScreen && 'flex-1 bg-background',
        className,
      )}
    >
      <ActivityIndicator size="large" color="#1677FF" />
      {message && (
        <AppText variant="body-secondary" tone="muted" className="mt-3">
          {message}
        </AppText>
      )}
    </View>
  )
}
