import React from 'react'
import { View } from 'react-native'
import { AppText } from '../primitives/AppText'
import { cn } from '@/shared/utils/cn'

export interface AppBadgeProps {
  count?: number | string
  dot?: boolean
  className?: string
  children?: React.ReactNode
}

export function AppBadge({
  count,
  dot = false,
  className,
  children,
}: AppBadgeProps) {
  if (children) {
    return (
      <View className="relative inline-flex">
        {children}
        {dot ? (
          <View className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-danger border border-white" />
        ) : count != null ? (
          <View className="absolute -top-1.5 -right-2 bg-danger px-1.5 py-0.5 rounded-full border border-white">
            <AppText variant="caption" tone="inverse" className="text-[10px] leading-tight font-bold">
              {count}
            </AppText>
          </View>
        ) : null}
      </View>
    )
  }

  if (dot) {
    return <View className={cn('w-2.5 h-2.5 rounded-full bg-danger', className)} />
  }

  return (
    <View className={cn('bg-danger px-2 py-0.5 rounded-full', className)}>
      <AppText variant="caption" tone="inverse" className="text-[11px] font-bold">
        {count}
      </AppText>
    </View>
  )
}
