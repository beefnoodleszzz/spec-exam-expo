/**
 * Sign-in screen (public route).
 *
 * SMS verification code login interface.
 */

import { useRef } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
// import { useRouter } from 'expo-router' // TODO: integrate after implementing auth

export default function SignInScreen() {
  const phoneRef = useRef<TextInput>(null)
  const codeRef = useRef<TextInput>(null)

  // TODO: Integrate with AuthService
  // This is a placeholder for testing navigation

  return (
    <View style={{flex: 1, padding: 16, justifyContent: 'center'}}>
      <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 24}}>
        登录
      </Text>

      <View style={{marginBottom: 16}}>
        <Text style={{fontSize: 12, marginBottom: 8}}>手机号</Text>
        <TextInput
          ref={phoneRef}
          placeholder="输入手机号"
          keyboardType="phone-pad"
          maxLength={11}
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            padding: 12,
            borderRadius: 8,
          }}
        />
      </View>

      <View style={{marginBottom: 16}}>
        <Text style={{fontSize: 12, marginBottom: 8}}>验证码</Text>
        <View style={{flexDirection: 'row', gap: 8}}>
          <TextInput
            ref={codeRef}
            placeholder="输入验证码"
            keyboardType="number-pad"
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              borderRadius: 8,
            }}
          />
          <Pressable
            style={{
              paddingHorizontal: 16,
              justifyContent: 'center',
              backgroundColor: '#2F5AFF',
              borderRadius: 8,
            }}
          >
            <Text style={{color: '#fff', fontSize: 12}}>发送</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={{
          padding: 12,
          backgroundColor: '#2F5AFF',
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{color: '#fff', fontWeight: 'bold'}}>登录</Text>
      </Pressable>
    </View>
  )
}
