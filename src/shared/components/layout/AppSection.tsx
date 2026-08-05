import React from 'react'
import { View } from 'react-native'
import { AppText } from '../primitives/AppText'
import { cn } from '@/shared/utils/cn'

export interface AppSectionProps {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function AppSection({
  title,
  subtitle,
  action,
  children,
  className,
}: AppSectionProps) {
  return (
    <View className={cn('mb-6', className)}>
      {(title || action) && (
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1 mr-2">
            {title && <AppText variant="heading">{title}</AppText>}
            {subtitle && (
              <AppText variant="caption" tone="muted" className="mt-0.5">
                {subtitle}
              </AppText>
            )}
          </View>
          {action}
        </View>
      )}
      {children}
    </View>
  )
}
