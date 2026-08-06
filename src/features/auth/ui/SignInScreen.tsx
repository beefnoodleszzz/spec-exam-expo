/**
 * Sign-in screen with SMS verification.
 *
 * Primary login interface for the application.
 */

import { useEffect, useRef } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useSmsLogin } from '../application/use-sms-login'
import { getAuthService } from '../auth.container'

export function SignInScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const phoneRef = useRef<TextInput>(null)
  const codeRef = useRef<TextInput>(null)

  const authService = getAuthService()
  const {
    state,
    setPhone,
    setCode,
    sendCode,
    login,
    setAgreementAccepted,
  } = useSmsLogin({
    authService,
  })

  useEffect(() => {
    if (state.loginError?.name !== 'UnauthorizedError') {
      return
    }

    router.replace('/(public)/sign-in')
  }, [state.loginError, router])

  const canSendCode =
    /^1[3-9]\d{9}$/.test(state.phone) &&
    !state.isSendingCode &&
    state.countdown === 60

  const canLogin =
    /^1[3-9]\d{9}$/.test(state.phone) &&
    state.verificationCode.trim().length > 0 &&
    state.requestId &&
    state.agreementAccepted &&
    !state.isLoggingIn

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 32 + insets.top,
          paddingBottom: 32 + insets.bottom,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{
          fontSize: 28,
          fontWeight: '700',
          marginBottom: 24,
        }}>
          登录
        </Text>

        {/* Phone Input */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{
            fontSize: 12,
            marginBottom: 8,
            color: '#666',
          }}>
            手机号
          </Text>
          <TextInput
            ref={phoneRef}
            placeholder="输入手机号"
            keyboardType="phone-pad"
            maxLength={11}
            value={state.phone}
            onChangeText={setPhone}
            editable={!state.isLoggingIn}
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              borderRadius: 8,
              fontSize: 16,
            }}
          />
        </View>

        {/* Code Input + Send Button */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{
            fontSize: 12,
            marginBottom: 8,
            color: '#666',
          }}>
            验证码
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              ref={codeRef}
              placeholder="输入验证码"
              keyboardType="number-pad"
              value={state.verificationCode}
              onChangeText={setCode}
              editable={!state.isLoggingIn}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: '#ddd',
                padding: 12,
                borderRadius: 8,
                fontSize: 16,
              }}
            />
            <Pressable
              onPress={sendCode}
              disabled={!canSendCode || state.isSendingCode}
              style={{
                paddingHorizontal: 16,
                justifyContent: 'center',
                backgroundColor: canSendCode ? '#2F5AFF' : '#ccc',
                borderRadius: 8,
              }}
            >
              <Text style={{
                color: '#fff',
                fontSize: 12,
                fontWeight: '600',
              }}>
                {state.isSendingCode
                  ? '发送中'
                  : state.countdown < 60
                    ? `${state.countdown}s`
                    : '获取验证码'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Error Messages */}
        {state.sendCodeError && (
          <View style={{
            padding: 12,
            backgroundColor: '#ffebee',
            borderRadius: 8,
            marginBottom: 16,
          }}>
            <Text style={{ color: '#c62828', fontSize: 12 }}>
              {state.sendCodeError.message}
            </Text>
          </View>
        )}

        {state.loginError && (
          <View style={{
            padding: 12,
            backgroundColor: '#ffebee',
            borderRadius: 8,
            marginBottom: 16,
          }}>
            <Text style={{ color: '#c62828', fontSize: 12 }}>
              {state.loginError.message}
            </Text>
          </View>
        )}

        {/* Agreement Checkbox */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <Pressable
            onPress={() => setAgreementAccepted(!state.agreementAccepted)}
            style={{
              width: 20,
              height: 20,
              borderWidth: 1,
              borderColor: '#2F5AFF',
              borderRadius: 4,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 8,
              backgroundColor: state.agreementAccepted ? '#2F5AFF' : 'white',
            }}
          >
            {state.agreementAccepted && (
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
            )}
          </Pressable>
          <Text style={{ fontSize: 12, color: '#666' }}>
            我已阅读并同意用户协议和隐私政策
          </Text>
        </View>

        {/* Login Button */}
        <Pressable
          onPress={login}
          disabled={!canLogin}
          style={{
            padding: 14,
            backgroundColor: canLogin ? '#2F5AFF' : '#ccc',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{
            color: '#fff',
            fontWeight: '700',
            fontSize: 16,
          }}>
            {state.isLoggingIn ? '登录中...' : '登录'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
