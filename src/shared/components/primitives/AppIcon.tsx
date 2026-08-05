import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { appStore } from '@/shared/auth/app-store'
import { lightTheme } from '@/shared/theme/light-theme'
import { darkTheme } from '@/shared/theme/dark-theme'

export type IconName = keyof typeof Ionicons.glyphMap

export type AppIconTone =
  | 'default'
  | 'muted'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'inverse'

export interface AppIconProps {
  name: IconName
  size?: number
  color?: string
  tone?: AppIconTone
  className?: string
}

export function AppIcon({
  name,
  size = 20,
  color,
  tone = 'default',
}: AppIconProps) {
  const themeMode = appStore((s) => s.themeMode)
  const theme = themeMode === 'dark' ? darkTheme : lightTheme

  let resolvedColor = color
  if (!resolvedColor) {
    switch (tone) {
      case 'muted':
        resolvedColor = theme.colors.foregroundMuted
        break
      case 'primary':
        resolvedColor = theme.colors.primary
        break
      case 'success':
        resolvedColor = theme.colors.success
        break
      case 'warning':
        resolvedColor = theme.colors.warning
        break
      case 'danger':
        resolvedColor = theme.colors.danger
        break
      case 'inverse':
        resolvedColor = theme.colors.foregroundInverse
        break
      case 'default':
      default:
        resolvedColor = theme.colors.foreground
        break
    }
  }

  return <Ionicons name={name} size={size} color={resolvedColor} />
}
