import React, { useState, useEffect } from 'react'
import { TouchableOpacity } from 'react-native'
import { AppInput, type AppInputProps } from './AppInput'
import { AppText } from '../primitives/AppText'

export interface AppCodeInputProps extends Omit<AppInputProps, 'keyboardType' | 'right'> {
  onSendCode: () => Promise<boolean> | boolean
  countdownSeconds?: number
}

export function AppCodeInput({
  onSendCode,
  countdownSeconds = 60,
  placeholder = "请输入验证码",
  maxLength = 6,
  ...props
}: AppCodeInputProps) {
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleSend = async () => {
    if (countdown > 0) return
    const success = await onSendCode()
    if (success) {
      setCountdown(countdownSeconds)
    }
  }

  return (
    <AppInput
      placeholder={placeholder}
      keyboardType="number-pad"
      maxLength={maxLength}
      right={
        <TouchableOpacity
          disabled={countdown > 0}
          onPress={() => void handleSend()}
          className="pl-2 border-l border-divider"
          accessibilityRole="button"
          accessibilityLabel="获取验证码"
        >
          <AppText
            variant="body-secondary"
            tone={countdown > 0 ? 'muted' : 'primary'}
            className="font-medium"
          >
            {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
          </AppText>
        </TouchableOpacity>
      }
      {...props}
    />
  )
}
