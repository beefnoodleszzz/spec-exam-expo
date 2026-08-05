import React from 'react'
import { View } from 'react-native'
import { sessionStore } from '@/shared/auth/session-store'
import { clearAllSessionData } from '@/shared/auth/session-service'
import { AppText } from '@/shared/components/primitives/AppText'
import { AppButton } from '@/shared/components/actions/AppButton'

export default function ProfileTabRoute() {
  const userId = sessionStore((s) => s.userId)

  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <AppText variant="title" className="font-bold">
        我的
      </AppText>
      <AppText variant="body-secondary" tone="muted" className="mt-2">
        用户 ID: {userId ?? '未知'}
      </AppText>
      <AppText variant="caption" tone="muted" className="mt-1">
        个人中心将在 Phase 10 实现
      </AppText>
      <AppButton
        variant="danger"
        size="md"
        onPress={() => void clearAllSessionData()}
        className="mt-8 px-6"
      >
        退出登录
      </AppButton>
    </View>
  )
}
