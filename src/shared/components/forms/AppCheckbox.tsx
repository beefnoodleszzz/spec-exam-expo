import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { AppText } from '../primitives/AppText'
import { AppIcon } from '../primitives/AppIcon'
import { cn } from '@/shared/utils/cn'

export interface AppCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

export function AppCheckbox({
  checked,
  onChange,
  label,
  disabled = false,
  className,
}: AppCheckboxProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      className={cn('flex-row items-center py-1.5', disabled && 'opacity-40', className)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
    >
      <View
        className={cn(
          'w-5 h-5 rounded items-center justify-center border border-border',
          checked ? 'bg-primary border-primary' : 'bg-surface',
        )}
      >
        {checked && <AppIcon name="checkmark" size={14} color="#FFFFFF" />}
      </View>
      {label && (
        <AppText variant="body-secondary" className="ml-2.5">
          {label}
        </AppText>
      )}
    </TouchableOpacity>
  )
}
