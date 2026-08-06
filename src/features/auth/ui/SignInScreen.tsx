/**
 * Sign-in screen with SMS verification.
 *
 * Primary login interface. Uses shared UI components.
 * Route guard (not this screen) handles redirection after login.
 */

import { View } from 'react-native'
import { AppScreen } from '@/shared/components/layout/AppScreen'
import { AppText } from '@/shared/components/primitives/AppText'
import { AppInput } from '@/shared/components/forms/AppInput'
import { AppButton } from '@/shared/components/actions/AppButton'
import { AppCheckbox } from '@/shared/components/forms/AppCheckbox'
import { useSmsLogin } from '../application/use-sms-login'
import { authService } from '../auth.container'

export function SignInScreen() {
  const {
    state,
    setPhone,
    setCode,
    sendCode,
    login,
    setAgreementAccepted,
  } = useSmsLogin({ authService })

  const PHONE_REGEX = /^1[3-9]\d{9}$/
  const canSendCode =
    PHONE_REGEX.test(state.phone) &&
    !state.isSendingCode &&
    state.countdown === 0

  const sendButtonLabel = state.isSendingCode
    ? '发送中'
    : state.countdown > 0
      ? `${state.countdown}s`
      : '获取验证码'

  return (
    <AppScreen
      scrollable
      keyboardAware
      safeAreaEdges={['top', 'left', 'right', 'bottom']}
      contentContainerClassName="py-12 px-6"
    >
      {/* Header */}
      <View className="mb-10">
        <AppText variant="display" className="mb-2">
          登录
        </AppText>
        <AppText variant="body-secondary" tone="muted">
          验证手机号，安全快捷登录
        </AppText>
      </View>

      {/* Phone Input */}
      <AppInput
        label="手机号"
        placeholder="请输入手机号"
        keyboardType="phone-pad"
        maxLength={11}
        value={state.phone}
        onChangeText={setPhone}
        disabled={state.isLoggingIn}
        accessibilityLabel="手机号输入框"
        containerClassName="mb-2"
      />

      {/* Verification Code + Send Button */}
      <View className="flex-row items-start gap-3 mb-2">
        <View className="flex-1">
          <AppInput
            label="验证码"
            placeholder="请输入验证码"
            keyboardType="number-pad"
            value={state.verificationCode}
            onChangeText={setCode}
            disabled={state.isLoggingIn}
            accessibilityLabel="验证码输入框"
            containerClassName="mb-0"
          />
        </View>
        <View className="pt-[26px]">
          <AppButton
            variant={canSendCode ? 'secondary' : 'ghost'}
            size="md"
            disabled={state.isSendingCode || state.countdown > 0}
            loading={state.isSendingCode}
            onPress={() => void sendCode()}
            accessibilityLabel="发送验证码"
          >
            {sendButtonLabel}
          </AppButton>
        </View>
      </View>

      {/* Send Code Error */}
      {state.sendCodeError && (
        <AppText
          variant="caption"
          tone="danger"
          className="mb-4 -mt-1"
          accessibilityRole="alert"
        >
          {state.sendCodeError.message}
        </AppText>
      )}

      {/* Login Error */}
      {state.loginError && (
        <AppText
          variant="caption"
          tone="danger"
          className="mb-4"
          accessibilityRole="alert"
        >
          {state.loginError.message}
        </AppText>
      )}

      {/* Agreement Checkbox */}
      <AppCheckbox
        checked={state.agreementAccepted}
        onChange={setAgreementAccepted}
        label="我已阅读并同意用户协议和隐私政策"
        className="mb-6"
      />

      {/* Login Button */}
      <AppButton
        variant="primary"
        size="lg"
        fullWidth
        disabled={state.isLoggingIn}
        loading={state.isLoggingIn}
        onPress={() => void login()}
        accessibilityLabel="登录按钮"
      >
        登录
      </AppButton>
    </AppScreen>
  )
}
