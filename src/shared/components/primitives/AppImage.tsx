import React from 'react'
import { Image as ExpoImage, type ImageProps as ExpoImageProps } from 'expo-image'
import { cn } from '@/shared/utils/cn'

export interface AppImageProps extends ExpoImageProps {
  className?: string
  alt?: string
}

export function AppImage({
  className,
  contentFit = 'cover',
  transition = 200,
  alt,
  ...props
}: AppImageProps) {
  return (
    <ExpoImage
      className={cn(className)}
      contentFit={contentFit}
      transition={transition}
      {...(alt ? { accessibilityLabel: alt } : {})}
      {...props}
    />
  )
}

