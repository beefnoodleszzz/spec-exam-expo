import React from 'react'
import { View } from 'react-native'
import { AppText } from '../primitives/AppText'
import { AppIcon, type IconName } from '../primitives/AppIcon'
import { cn } from '@/shared/utils/cn'

export interface AppAlertProps {
  type?: 'info' | 'success' | 'warning' | 'danger'
  message: string
  description?: string
  className?: string
}

const alertTypeMap = {
  info: { bg: 'bg-primary-soft', border: 'border-primary', icon: 'information-circle' as IconName, color: '#1677FF' },
  success: { bg: 'bg-green-50', border: 'border-success', icon: 'checkmark-circle' as IconName, color: '#00B42A' },
  warning: { bg: 'bg-orange-50', border: 'border-warning', icon: 'warning' as IconName, color: '#FF7D00' },
  danger: { bg: 'bg-red-50', border: 'border-danger', icon: 'alert-circle' as IconName, color: '#F53F3F' },
}

export function AppAlert({
  type = 'info',
  message,
  description,
  className,
}: AppAlertProps) {
  const config = alertTypeMap[type]

  return (
    <View
      className={cn(
        'flex-row p-3.5 rounded-xl border border-l-4 mb-3',
        config.bg,
        config.border,
        className,
      )}
    >
      <View className="mr-3 mt-0.5">
        <AppIcon name={config.icon} size={20} color={config.color} />
      </View>
      <View className="flex-1">
        <AppText variant="label" className="font-semibold">
          {message}
        </AppText>
        {description && (
          <AppText variant="caption" tone="secondary" className="mt-0.5">
            {description}
          </AppText>
        )}
      </View>
    </View>
  )
}
