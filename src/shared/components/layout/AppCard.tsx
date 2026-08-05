import React from 'react'
import { View, TouchableOpacity, type ViewProps } from 'react-native'
import { cn } from '@/shared/utils/cn'

export interface AppCardProps extends ViewProps {
  className?: string
  children?: React.ReactNode
  variant?: 'default' | 'elevated' | 'outline'
  onPress?: () => void
}

export function AppCard({
  className,
  children,
  variant = 'default',
  onPress,
  ...props
}: AppCardProps) {
  const baseClasses = 'bg-surface rounded-xl p-4 mb-3'
  const variantClasses = {
    default: 'border border-border',
    elevated: 'shadow-sm',
    outline: 'border border-border-strong',
  }

  const combinedClass = cn(baseClasses, variantClasses[variant], className)

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        className={combinedClass}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    )
  }

  return (
    <View className={combinedClass} {...props}>
      {children}
    </View>
  )
}
