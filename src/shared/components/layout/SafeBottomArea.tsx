import React from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from '@/shared/utils/cn'

export interface SafeBottomAreaProps {
  className?: string
  children?: React.ReactNode
}

export function SafeBottomArea({ className, children }: SafeBottomAreaProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      className={cn('bg-surface border-t border-divider px-4 pt-3', className)}
    >
      {children}
    </View>
  )
}
