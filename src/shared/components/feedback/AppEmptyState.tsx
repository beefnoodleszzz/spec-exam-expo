import React from 'react'
import { View } from 'react-native'
import { AppText } from '../primitives/AppText'
import { AppIcon, type IconName } from '../primitives/AppIcon'
import { AppButton } from '../actions/AppButton'
import { cn } from '@/shared/utils/cn'

export interface AppEmptyStateProps {
  icon?: IconName
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function AppEmptyState({
  icon = 'folder-open-outline',
  title = '暂无数据',
  description,
  actionLabel,
  onAction,
  className,
}: AppEmptyStateProps) {
  return (
    <View className={cn('flex-1 items-center justify-center p-6 my-8', className)}>
      <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
        <AppIcon name={icon} size={32} color="#86909C" />
      </View>
      <AppText variant="heading" tone="secondary" align="center">
        {title}
      </AppText>
      {description && (
        <AppText variant="body-secondary" tone="muted" align="center" className="mt-1.5 max-w-xs">
          {description}
        </AppText>
      )}
      {actionLabel && onAction && (
        <AppButton variant="secondary" size="sm" onPress={onAction} className="mt-5">
          {actionLabel}
        </AppButton>
      )}
    </View>
  )
}
