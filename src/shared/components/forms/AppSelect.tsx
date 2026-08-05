import React, { useState } from 'react'
import { TouchableOpacity, View, Modal, FlatList } from 'react-native'
import { AppText } from '../primitives/AppText'
import { AppIcon } from '../primitives/AppIcon'
import { AppHeader } from '../layout/AppHeader'
import { cn } from '@/shared/utils/cn'

export interface SelectOption {
  label: string
  value: string | number
}

export interface AppSelectProps {
  label?: string
  value?: string | number
  options: SelectOption[]
  onChange: (value: string | number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function AppSelect({
  label,
  value,
  options,
  onChange,
  placeholder = '请选择',
  disabled = false,
  className,
}: AppSelectProps) {
  const [visible, setVisible] = useState(false)

  const selectedOption = options.find((o) => o.value === value)

  return (
    <View className={cn('mb-4 w-full', className)}>
      {label && (
        <AppText variant="label" className="mb-1.5">
          {label}
        </AppText>
      )}

      <TouchableOpacity
        activeOpacity={0.7}
        disabled={disabled}
        onPress={() => setVisible(true)}
        className={cn(
          'flex-row items-center justify-between h-12 px-3.5 bg-surface border border-border rounded-xl',
          disabled && 'bg-gray-100 opacity-60',
        )}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
      >
        <AppText
          variant="body"
          tone={selectedOption ? 'default' : 'muted'}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </AppText>
        <AppIcon name="chevron-down" size={20} color="#86909C" />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background">
          <AppHeader
            title={label || placeholder}
            showBack={false}
            right={
              <TouchableOpacity onPress={() => setVisible(false)} className="p-2">
                <AppText variant="label" tone="primary">
                  关闭
                </AppText>
              </TouchableOpacity>
            }
          />
          <FlatList
            data={options}
            keyExtractor={(item) => String(item.value)}
            renderItem={({ item }) => {
              const isSelected = item.value === value
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    onChange(item.value)
                    setVisible(false)
                  }}
                  className={cn(
                    'flex-row items-center justify-between px-4 py-3.5 bg-surface border-b border-divider',
                    isSelected && 'bg-primary-soft',
                  )}
                >
                  <AppText
                    variant="body"
                    tone={isSelected ? 'primary' : 'default'}
                    className={isSelected ? 'font-semibold' : 'font-normal'}
                  >
                    {item.label}
                  </AppText>
                  {isSelected && <AppIcon name="checkmark" size={20} color="#1677FF" />}
                </TouchableOpacity>
              )
            }}
          />
        </View>
      </Modal>
    </View>
  )
}
