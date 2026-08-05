import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { AppIcon, type IconName } from '../primitives/AppIcon'
import { AppText } from '../primitives/AppText'
import { cn } from '@/shared/utils/cn'

export interface AppFloatingButtonProps {
  icon: IconName
  label?: string
  onPress?: () => void
  className?: string
  accessibilityLabel: string
}

export function AppFloatingButton({
  icon,
  label,
  onPress,
  className,
  accessibilityLabel,
}: AppFloatingButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={cn(
        'absolute bottom-6 right-6 bg-primary flex-row items-center px-4 h-13 rounded-full shadow-lg border border-white/20 active:bg-primary-pressed',
        !label && 'w-13 justify-center px-0',
        className,
      )}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <AppIcon name={icon} size={24} color="#FFFFFF" />
      {label && (
        <AppText variant="label" tone="inverse" className="ml-2 font-semibold">
          {label}
        </AppText>
      )}
    </TouchableOpacity>
  )
}
