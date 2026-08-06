import React from 'react'
import { View, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'

import { AppScreen } from '@/shared/components/layout/AppScreen'
import { AppText } from '@/shared/components/primitives/AppText'
import { AppCard } from '@/shared/components/layout/AppCard'
import { AppButton } from '@/shared/components/actions/AppButton'
import { AppErrorState } from '@/shared/components/feedback/AppErrorState'
import { AppEmptyState } from '@/shared/components/feedback/AppEmptyState'
import { getErrorMessage } from '@/shared/api/errors/app-error'

import { appStore } from '@/shared/auth/app-store'
import { sessionStore } from '@/shared/auth/session-store'
import { homeQueries } from '../application/home.query'
import { authService } from '@/features/auth/auth.container'

function HomeSkeleton() {
  return (
    <View className="flex-1 p-5 pt-10">
      <View className="h-10 bg-surface/50 rounded-lg mb-6" />
      <View className="h-32 bg-surface/50 rounded-lg mb-6" />
      <View className="flex-row flex-wrap justify-between">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} className="w-[30%] h-24 bg-surface/50 rounded-lg mb-4" />
        ))}
      </View>
    </View>
  )
}

export function HomeScreen() {
  const router = useRouter()
  const examProfile = appStore((s) => s.currentExamProfile)
  const userId = sessionStore((s) => s.userId)

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery(homeQueries.dashboard(examProfile?.examTypeId ?? ''))

  const handleLogout = async () => {
    await authService.logout()
  }

  if (!examProfile) {
    return null
  }

  if (isLoading) {
    return (
      <AppScreen>
        <HomeSkeleton />
      </AppScreen>
    )
  }

  if (isError && !data) {
    return (
      <AppScreen>
        <AppErrorState
          message={getErrorMessage(error)}
          onRetry={refetch}
        />
      </AppScreen>
    )
  }

  if (!data) {
    return (
      <AppScreen>
        <AppEmptyState
          title="暂无数据"
          description="首页没有任何内容"
          actionLabel="刷新"
          onAction={refetch}
        />
      </AppScreen>
    )
  }

  const isRefreshing = isFetching && !isLoading

  return (
    <AppScreen>
      <ScrollView
        contentContainerClassName="p-5 pb-10"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} />
        }
      >
        {isError && data && (
          <View className="mb-4 p-3 bg-error/10 rounded-lg">
            <AppText tone="danger" variant="body">
              刷新失败: {getErrorMessage(error)} (当前显示缓存数据)
            </AppText>
          </View>
        )}

        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-1">
            <AppText variant="heading" className="mb-1">
              用户 {userId?.slice(0, 8) ?? 'User'}
            </AppText>
            <View className="flex-row items-center">
              <AppText variant="body" tone="secondary">
                当前科目：{examProfile.examTypeName}
              </AppText>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(protected)/exam-profile')}
            className="px-3 py-1 bg-primary/10 rounded-full"
          >
            <AppText variant="body-secondary" tone="primary">切换</AppText>
          </TouchableOpacity>
        </View>

        {data.banners.length > 0 && data.banners[0] && (
          <View className="mb-6 h-32 rounded-xl overflow-hidden bg-surface">
            <Image
              source={{ uri: data.banners[0].imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        )}

        <AppCard className="mb-6 p-4">
          <AppText variant="heading" className="mb-2">学习进度</AppText>
          {data.examDay !== null && (
            <AppText variant="body" tone="primary" className="mb-1">
              考试倒计时：{data.examDay} 天
            </AppText>
          )}
          <AppText variant="body" tone="secondary">
            共有 {data.totalSubject} 题，已答 {data.totalAnswer}
          </AppText>
          <AppText variant="body" tone="secondary">
            答题率 {data.answerRate}
          </AppText>
        </AppCard>

        <View className="flex-row flex-wrap justify-between mb-6">
          {data.quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              className="w-[30%] mb-4 items-center"
              onPress={() => {
                if (action.route === 'practice') {
                  router.push('/(protected)/practice')
                } else if (action.route === 'simulation') {
                  router.push('/(protected)/simulation')
                } else if (action.route === 'questions') {
                  router.push('/(protected)/questions')
                }
              }}
            >
              <View className="w-14 h-14 bg-surface rounded-2xl items-center justify-center mb-2">
                <AppText variant="heading">{action.title[0]}</AppText>
              </View>
              <AppText variant="body-secondary" className="text-center">
                {action.title}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        {data.notices.length > 0 && (
          <View className="mb-6">
            <AppText variant="heading" className="mb-3">热门资讯</AppText>
            {data.notices.map((notice) => (
              <AppCard key={notice.id} className="mb-3 p-4 flex-row items-center">
                <View className="flex-1 pr-3">
                  <AppText variant="body" className="mb-1" numberOfLines={2}>
                    {notice.title}
                  </AppText>
                  {notice.description && (
                    <AppText variant="body-secondary" tone="secondary" numberOfLines={1}>
                      {notice.description}
                    </AppText>
                  )}
                  <AppText variant="caption" tone="secondary" className="mt-2">
                    {notice.date}
                  </AppText>
                </View>
                {notice.imageUrl && (
                  <Image
                    source={{ uri: notice.imageUrl }}
                    className="w-20 h-16 rounded-md bg-background"
                  />
                )}
              </AppCard>
            ))}
          </View>
        )}

        <View className="mt-8 mb-4 border-t border-border pt-6">
          <AppText variant="body-secondary" tone="secondary" className="mb-4 text-center">
            Debug / Development Actions
          </AppText>
          <AppButton variant="outline" onPress={() => void handleLogout()}>
            退出登录
          </AppButton>
        </View>
      </ScrollView>
    </AppScreen>
  )
}
