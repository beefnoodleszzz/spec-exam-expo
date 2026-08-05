import React from 'react'
import { TouchableOpacity } from 'react-native'
import { AppText } from '../primitives/AppText'
import { cn } from '@/shared/utils/cn'

export interface AppLinkProps {
  children: string
  onPress?: () => void
  disabled?: boolean
  className?: string
}

export function AppLink({
  children,
  onPress,
  disabled = false,
  className,
}: AppLinkProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={onPress}
      className={cn('py-1', disabled && 'opacity-40', className)}
      accessibilityRole="link"
    >
      <AppText variant="body-secondary" tone="primary" className="underline">
        {children}
      </AppText>
    </TouchableOpacity>
  )
}
