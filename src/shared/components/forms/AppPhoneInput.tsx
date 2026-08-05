import React from 'react'
import { AppInput, type AppInputProps } from './AppInput'
import { AppText } from '../primitives/AppText'
import { View } from 'react-native'

export type AppPhoneInputProps = Omit<AppInputProps, 'keyboardType' | 'left'>

export function AppPhoneInput(props: AppPhoneInputProps) {
  return (
    <AppInput
      placeholder="请输入手机号"
      keyboardType="phone-pad"
      maxLength={11}
      showClear={true}
      left={
        <View className="flex-row items-center border-r border-divider pr-2 mr-1">
          <AppText variant="body" tone="secondary" className="font-medium">
            +86
          </AppText>
        </View>
      }
      {...props}
    />
  )
}
