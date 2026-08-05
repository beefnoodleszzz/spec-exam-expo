import React from 'react'
import { View } from 'react-native'
import { cn } from '@/shared/utils/cn'

export interface AppDividerProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function AppDivider({
  className,
  orientation = 'horizontal',
}: AppDividerProps) {
  if (orientation === 'vertical') {
    return <View className={cn('w-[1px] h-full bg-divider my-0.5', className)} />
  }

  return <View className={cn('h-[1px] w-full bg-divider my-2', className)} />
}
