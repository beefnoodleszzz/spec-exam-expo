import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { AppText } from '../primitives/AppText'
import { cn } from '@/shared/utils/cn'

export interface AppRadioProps {
  selected: boolean
  onSelect: () => void
  label?: string
  disabled?: boolean
  className?: string
}

export function AppRadio({
  selected,
  onSelect,
  label,
  disabled = false,
  className,
}: AppRadioProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={onSelect}
      className={cn('flex-row items-center py-1.5', disabled && 'opacity-40', className)}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
    >
      <View
        className={cn(
          'w-5 h-5 rounded-full items-center justify-center border',
          selected ? 'border-primary bg-surface' : 'border-border bg-surface',
        )}
      >
        {selected && <View className="w-2.5 h-2.5 rounded-full bg-primary" />}
      </View>
      {label && (
        <AppText variant="body-secondary" className="ml-2.5">
          {label}
        </AppText>
      )}
    </TouchableOpacity>
  )
}
