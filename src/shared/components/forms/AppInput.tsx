import React, { useState } from 'react'
import {
  View,
  TextInput as RNTextInput,
  TouchableOpacity,
  type TextInputProps as RNTextInputProps,
} from 'react-native'
import { AppText } from '../primitives/AppText'
import { AppIcon } from '../primitives/AppIcon'
import { lightSemanticColors } from '@/shared/theme/semantic/colors'
import { cn } from '@/shared/utils/cn'

export interface AppInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string
  error?: string
  helperText?: string
  disabled?: boolean
  left?: React.ReactNode
  right?: React.ReactNode
  showClear?: boolean
  className?: string
  containerClassName?: string
}

export function AppInput({
  label,
  error,
  helperText,
  disabled = false,
  left,
  right,
  showClear = false,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  className,
  containerClassName,
  ...props
}: AppInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isSecureVisible, setIsSecureVisible] = useState(!secureTextEntry)

  const handleClear = () => {
    if (onChangeText) {
      onChangeText('')
    }
  }

  const borderClass = error
    ? 'border-danger'
    : isFocused
    ? 'border-primary'
    : 'border-border'

  return (
    <View className={cn('mb-4 w-full', containerClassName)}>
      {label && (
        <AppText variant="label" className="mb-1.5">
          {label}
        </AppText>
      )}

      <View
        className={cn(
          'flex-row items-center h-12 px-3.5 bg-surface border rounded-xl',
          borderClass,
          disabled && 'bg-gray-100 opacity-60',
          className,
        )}
      >
        {left && <View className="mr-2.5">{left}</View>}

        <RNTextInput
          className="flex-1 text-base text-foreground font-normal p-0 h-full"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={lightSemanticColors.foregroundMuted}
          editable={!disabled}
          secureTextEntry={secureTextEntry && !isSecureVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {showClear && value && value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            className="p-1 ml-1"
            accessibilityLabel="清空输入"
            accessibilityRole="button"
          >
            <AppIcon name="close-circle" size={18} color={lightSemanticColors.foregroundMuted} />
          </TouchableOpacity>
        )}

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecureVisible(!isSecureVisible)}
            className="p-1 ml-1"
            accessibilityLabel={isSecureVisible ? '隐藏密码' : '显示密码'}
            accessibilityRole="button"
          >
            <AppIcon
              name={isSecureVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={lightSemanticColors.foregroundMuted}
            />
          </TouchableOpacity>
        )}

        {right && <View className="ml-2">{right}</View>}
      </View>

      {error ? (
        <AppText variant="caption" tone="danger" className="mt-1">
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" tone="muted" className="mt-1">
          {helperText}
        </AppText>
      ) : null}
    </View>
  )
}
