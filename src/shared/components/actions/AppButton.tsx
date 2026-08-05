import React, { useRef } from 'react'
import {
  TouchableOpacity,
  ActivityIndicator,
  View,
} from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'
import { AppText } from '../primitives/AppText'
import { cn } from '@/shared/utils/cn'

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-xl min-h-[44px]',
  {
    variants: {
      variant: {
        primary: 'bg-primary active:bg-primary-pressed',
        secondary: 'bg-primary-soft active:bg-blue-100',
        outline: 'border border-primary bg-transparent active:bg-primary-soft',
        danger: 'bg-danger active:bg-red-600',
        ghost: 'bg-transparent active:bg-gray-100',
      },
      size: {
        sm: 'h-9 px-3 min-h-[36px]',
        md: 'h-11 px-4 min-h-[44px]',
        lg: 'h-13 px-6 min-h-[52px]',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
)

const buttonTextTones = {
  primary: 'inverse' as const,
  secondary: 'primary' as const,
  outline: 'primary' as const,
  danger: 'inverse' as const,
  ghost: 'primary' as const,
}

export interface AppButtonProps
  extends VariantProps<typeof buttonVariants> {
  children?: React.ReactNode
  loading?: boolean
  disabled?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  onPress?: () => void
  className?: string
  debounceTimeMs?: number
  accessibilityLabel?: string
}

export function AppButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  onPress,
  className,
  debounceTimeMs = 400,
  accessibilityLabel,
}: AppButtonProps) {
  const lastClickTimeRef = useRef<number>(0)
  const isInteractive = !disabled && !loading

  const handlePress = () => {
    if (!isInteractive || !onPress) return
    const now = Date.now()
    if (now - lastClickTimeRef.current < debounceTimeMs) return
    lastClickTimeRef.current = now
    onPress()
  }

  const textTone = buttonTextTones[variant ?? 'primary']

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={!isInteractive}
      onPress={handlePress}
      className={cn(
        buttonVariants({ variant, size, fullWidth }),
        (!isInteractive) && 'opacity-50',
        className,
      )}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      accessibilityLabel={accessibilityLabel}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#1677FF'}
        />
      ) : (
        <View className="flex-row items-center justify-center">
          {iconLeft && <View className="mr-2">{iconLeft}</View>}
          {typeof children === 'string' ? (
            <AppText
              variant={size === 'sm' ? 'body-secondary' : 'label'}
              tone={textTone}
              className="font-semibold"
            >
              {children}
            </AppText>
          ) : (
            children
          )}
          {iconRight && <View className="ml-2">{iconRight}</View>}
        </View>
      )}
    </TouchableOpacity>
  )
}
