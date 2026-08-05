import React from 'react'
import { View } from 'react-native'
import { AppText } from '../primitives/AppText'
import { AppIcon } from '../primitives/AppIcon'
import { AppButton } from '../actions/AppButton'
import { getErrorMessage } from '@/shared/api/errors/app-error'
import { cn } from '@/shared/utils/cn'

export interface AppErrorStateProps {
  error?: unknown
  message?: string
  onRetry?: () => void
  className?: string
}

export function AppErrorState({
  error,
  message,
  onRetry,
  className,
}: AppErrorStateProps) {
  const displayMessage = message || (error ? getErrorMessage(error) : '网络异常，请稍后重试')

  return (
    <View className={cn('flex-1 items-center justify-center p-6 my-8', className)}>
      <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
        <AppIcon name="alert-circle-outline" size={36} color="#F53F3F" />
      </View>
      <AppText variant="heading" tone="danger" align="center">
        加载失败
      </AppText>
      <AppText variant="body-secondary" tone="muted" align="center" className="mt-1.5 max-w-xs">
        {displayMessage}
      </AppText>
      {onRetry && (
        <AppButton variant="primary" size="md" onPress={onRetry} className="mt-5">
          重新加载
        </AppButton>
      )}
    </View>
  )
}
