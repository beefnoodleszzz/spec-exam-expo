import React from 'react'
import { View, type DimensionValue } from 'react-native'
import { cn } from '@/shared/utils/cn'

export interface AppSkeletonProps {
  className?: string
  width?: DimensionValue
  height?: DimensionValue
  borderRadius?: number
}

export function AppSkeleton({
  className,
  width = '100%',
  height = 20,
  borderRadius = 8,
}: AppSkeletonProps) {
  return (
    <View
      style={{
        width,
        height,
        borderRadius,
      }}
      className={cn('bg-gray-200 animate-pulse', className)}
    />
  )
}

