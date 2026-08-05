import React from 'react'
import { View } from 'react-native'
import { AppImage } from '../primitives/AppImage'
import { AppText } from '../primitives/AppText'
import { AppIcon } from '../primitives/AppIcon'
import { cn } from '@/shared/utils/cn'

export interface AppAvatarProps {
  source?: string
  name?: string
  size?: number
  className?: string
}

export function AppAvatar({
  source,
  name,
  size = 44,
  className,
}: AppAvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : ''

  if (source) {
    return (
      <AppImage
        source={{ uri: source }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        className={cn('bg-gray-200', className)}
        alt={name || '用户头像'}
      />
    )
  }

  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={cn('bg-primary-soft items-center justify-center border border-primary/20', className)}
    >
      {initial ? (
        <AppText variant="heading" tone="primary" className="font-bold">
          {initial}
        </AppText>
      ) : (
        <AppIcon name="person" size={size * 0.5} color="#1677FF" />
      )}
    </View>
  )
}
