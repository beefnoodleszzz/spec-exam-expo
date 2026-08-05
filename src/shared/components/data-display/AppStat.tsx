import React from 'react'
import { View } from 'react-native'
import { AppText } from '../primitives/AppText'
import { cn } from '@/shared/utils/cn'

export interface AppStatProps {
  label: string
  value: number | string
  unit?: string
  tone?: 'default' | 'primary' | 'success' | 'danger'
  className?: string
}

export function AppStat({
  label,
  value,
  unit,
  tone = 'default',
  className,
}: AppStatProps) {
  return (
    <View className={cn('items-center justify-center py-2 px-3', className)}>
      <View className="flex-row items-baseline">
        <AppText
          variant="title"
          tone={tone}
          className="font-bold text-2xl"
        >
          {value}
        </AppText>
        {unit && (
          <AppText variant="caption" tone="muted" className="ml-1 font-medium">
            {unit}
          </AppText>
        )}
      </View>
      <AppText variant="caption" tone="muted" className="mt-0.5">
        {label}
      </AppText>
    </View>
  )
}
