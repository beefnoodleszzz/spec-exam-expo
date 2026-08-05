import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { AppText } from '../primitives/AppText'
import { AppIcon } from '../primitives/AppIcon'
import { cn } from '@/shared/utils/cn'

export interface AppHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  right?: React.ReactNode
  className?: string
}

export function AppHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  right,
  className,
}: AppHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (router.canGoBack()) {
      router.back()
    }
  }

  return (
    <View
      className={cn(
        'flex-row items-center justify-between h-12 px-4 bg-surface border-b border-divider',
        className,
      )}
    >
      <View className="flex-row items-center flex-1 mr-2">
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            className="p-1 mr-2 -ml-1 rounded-full active:bg-gray-100"
            accessibilityRole="button"
            accessibilityLabel="返回"
          >
            <AppIcon name="chevron-back" size={24} />
          </TouchableOpacity>
        )}
        <View className="flex-1">
          <AppText variant="heading" numberOfLines={1}>
            {title}
          </AppText>
          {subtitle && (
            <AppText variant="caption" tone="muted" numberOfLines={1}>
              {subtitle}
            </AppText>
          )}
        </View>
      </View>
      {right && <View className="flex-row items-center">{right}</View>}
    </View>
  )
}
