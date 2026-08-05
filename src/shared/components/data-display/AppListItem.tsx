import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { AppText } from '../primitives/AppText'
import { AppIcon, type IconName } from '../primitives/AppIcon'
import { cn } from '@/shared/utils/cn'

export interface AppListItemProps {
  title: string
  subtitle?: string
  leftIcon?: IconName
  left?: React.ReactNode
  right?: React.ReactNode
  onPress?: () => void
  showChevron?: boolean
  disabled?: boolean
  className?: string
}

export function AppListItem({
  title,
  subtitle,
  leftIcon,
  left,
  right,
  onPress,
  showChevron = true,
  disabled = false,
  className,
}: AppListItemProps) {
  const content = (
    <View className="flex-row items-center flex-1 py-3.5 px-4 bg-surface border-b border-divider">
      {leftIcon && (
        <View className="mr-3">
          <AppIcon name={leftIcon} size={22} color="#4E5969" />
        </View>
      )}
      {left && <View className="mr-3">{left}</View>}
      <View className="flex-1">
        <AppText variant="body" className="font-normal">
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="caption" tone="muted" className="mt-0.5">
            {subtitle}
          </AppText>
        )}
      </View>
      {right && <View className="ml-2">{right}</View>}
      {showChevron && onPress && (
        <View className="ml-1.5">
          <AppIcon name="chevron-forward" size={18} color="#C9CDD4" />
        </View>
      )}
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={disabled}
        onPress={onPress}
        className={cn(disabled && 'opacity-40', className)}
        accessibilityRole="button"
      >
        {content}
      </TouchableOpacity>
    )
  }

  return <View className={cn(className)}>{content}</View>
}
