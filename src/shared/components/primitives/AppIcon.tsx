import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { lightSemanticColors } from '@/shared/theme/semantic/colors'

export type IconName = keyof typeof Ionicons.glyphMap

export interface AppIconProps {
  name: IconName
  size?: number
  color?: string
  className?: string
}

export function AppIcon({
  name,
  size = 20,
  color = lightSemanticColors.foreground,
}: AppIconProps) {
  return <Ionicons name={name} size={size} color={color} />
}
