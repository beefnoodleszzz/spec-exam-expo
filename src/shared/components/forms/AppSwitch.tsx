import React from 'react'
import { Switch as RNSwitch, View } from 'react-native'
import { AppText } from '../primitives/AppText'
import { lightSemanticColors } from '@/shared/theme/semantic/colors'
import { cn } from '@/shared/utils/cn'

export interface AppSwitchProps {
  value: boolean
  onValueChange: (value: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

export function AppSwitch({
  value,
  onValueChange,
  label,
  disabled = false,
  className,
}: AppSwitchProps) {
  return (
    <View className={cn('flex-row items-center justify-between py-2', className)}>
      {label && <AppText variant="body">{label}</AppText>}
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: lightSemanticColors.border,
          true: lightSemanticColors.primary,
        }}
        thumbColor="#FFFFFF"
      />
    </View>
  )
}
