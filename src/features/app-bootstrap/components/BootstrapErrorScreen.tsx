import React from 'react'
import { View } from 'react-native'
import { AppText } from '@/shared/components/primitives/AppText'
import { AppButton } from '@/shared/components/actions/AppButton'
import { AppIcon } from '@/shared/components/primitives/AppIcon'
import { lightSemanticColors } from '@/shared/theme/semantic/colors'

export interface BootstrapErrorScreenProps {
  message?: string | null
  onRetry: () => void
}

export function BootstrapErrorScreen({ message, onRetry }: BootstrapErrorScreenProps) {
  return (
    <View className="flex-1 items-center justify-center p-6 bg-background">
      <View className="w-16 h-16 rounded-full bg-danger-soft items-center justify-center mb-4">
        <AppIcon name="alert-circle-outline" size={36} color={lightSemanticColors.danger} />
      </View>
      <AppText variant="heading" tone="danger" align="center">
        应用启动失败
      </AppText>
      <AppText variant="body-secondary" tone="muted" align="center" className="mt-2 mb-6 max-w-xs">
        {message || '加载本地配置异常，请尝试重新打开应用'}
      </AppText>
      <AppButton variant="primary" size="md" onPress={onRetry}>
        重新加载
      </AppButton>
    </View>
  )
}
