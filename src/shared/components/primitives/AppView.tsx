import React from 'react'
import { View as RNView, type ViewProps as RNViewProps } from 'react-native'
import { cn } from '@/shared/utils/cn'

export interface AppViewProps extends RNViewProps {
  className?: string
  children?: React.ReactNode
}

export function AppView({ className, children, ...props }: AppViewProps) {
  return (
    <RNView className={cn(className)} {...props}>
      {children}
    </RNView>
  )
}
