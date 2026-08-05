import React from 'react'
import {
  Pressable as RNPressable,
  type PressableProps as RNPressableProps,
} from 'react-native'
import { interactiveStates } from '@/shared/theme/semantic/states'
import { cn } from '@/shared/utils/cn'

export interface AppPressableProps extends Omit<RNPressableProps, 'style'> {
  className?: string
  disabled?: boolean
  children?: React.ReactNode | ((state: { pressed: boolean }) => React.ReactNode)
}

export function AppPressable({
  className,
  disabled,
  children,
  hitSlop = interactiveStates.minimumHitSlop,
  ...props
}: AppPressableProps) {
  return (
    <RNPressable
      className={cn(disabled && 'opacity-40', className)}
      disabled={disabled}
      hitSlop={hitSlop}
      style={({ pressed }) => ({
        opacity: pressed && !disabled ? interactiveStates.activeOpacity : 1,
      })}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      {...props}
    >
      {typeof children === 'function' ? children : children}
    </RNPressable>
  )
}
