import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { AppIcon, type IconName } from '../primitives/AppIcon'
import { lightSemanticColors } from '@/shared/theme/semantic/colors'
import { cn } from '@/shared/utils/cn'

export interface AppIconButtonProps {
  name: IconName
  size?: number
  color?: string
  onPress?: () => void
  disabled?: boolean
  className?: string
  accessibilityLabel: string
}

export function AppIconButton({
  name,
  size = 22,
  color = lightSemanticColors.foreground,
  onPress,
  disabled = false,
  className,
  accessibilityLabel,
}: AppIconButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'w-11 h-11 items-center justify-center rounded-full active:bg-gray-100',
        disabled && 'opacity-40',
        className,
      )}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      <View>
        <AppIcon name={name} size={size} color={color} />
      </View>
    </TouchableOpacity>
  )
}
