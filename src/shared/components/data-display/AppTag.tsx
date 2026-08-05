import React from 'react'
import { View } from 'react-native'
import { AppText } from '../primitives/AppText'
import { cn } from '@/shared/utils/cn'

export interface AppTagProps {
  children: string
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'vip' | 'neutral'
  size?: 'sm' | 'md'
  className?: string
}

const tagVariantStyles = {
  primary: 'bg-primary-soft border-primary/20 text-primary',
  success: 'bg-green-50 border-success/20 text-success',
  warning: 'bg-orange-50 border-warning/20 text-warning',
  danger: 'bg-red-50 border-danger/20 text-danger',
  vip: 'bg-amber-50 border-vip/20 text-vip',
  neutral: 'bg-gray-100 border-border text-foreground-secondary',
}

const tagToneMap = {
  primary: 'primary' as const,
  success: 'success' as const,
  warning: 'warning' as const,
  danger: 'danger' as const,
  vip: 'default' as const,
  neutral: 'secondary' as const,
}

export function AppTag({
  children,
  variant = 'neutral',
  size = 'md',
  className,
}: AppTagProps) {
  return (
    <View
      className={cn(
        'border rounded-md px-2 py-0.5 self-start',
        size === 'sm' ? 'px-1.5 py-0' : 'px-2 py-0.5',
        tagVariantStyles[variant],
        className,
      )}
    >
      <AppText
        variant={size === 'sm' ? 'caption' : 'body-secondary'}
        tone={tagToneMap[variant]}
        className={cn('font-medium', size === 'sm' && 'text-[11px]')}
      >
        {children}
      </AppText>
    </View>
  )
}
