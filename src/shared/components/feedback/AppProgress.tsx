import React from 'react'
import { View } from 'react-native'
import { AppText } from '../primitives/AppText'
import { cn } from '@/shared/utils/cn'

export interface AppProgressProps {
  progress: number // 0 to 100
  showLabel?: boolean
  height?: number
  className?: string
  color?: string
}

export function AppProgress({
  progress,
  showLabel = false,
  height = 8,
  className,
  color = 'bg-primary',
}: AppProgressProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <View className={cn('w-full', className)}>
      {showLabel && (
        <View className="flex-row justify-between items-center mb-1">
          <AppText variant="caption" tone="muted">
            进度
          </AppText>
          <AppText variant="caption" tone="primary" className="font-medium">
            {Math.round(clampedProgress)}%
          </AppText>
        </View>
      )}
      <View style={{ height }} className="w-full bg-gray-200 rounded-full overflow-hidden">
        <View
          style={{ width: `${clampedProgress}%`, height: '100%' }}
          className={cn('rounded-full', color)}
        />
      </View>
    </View>
  )
}
