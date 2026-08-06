import React from 'react'
import { View, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'

import { AppScreen, AppText, AppButton } from '@/shared/components'

import { appStore } from '@/shared/auth/app-store'
import { examScopedQueryKeys } from '@/shared/query/exam-scoped-query-keys'
import { SimulationRemoteImpl } from '../data/simulation.remote.impl'
import { simulationService } from '../application/simulation.service'
import { useSimulationSessionStore } from '../state/simulation-session.store'

const remote = new SimulationRemoteImpl()

export function SimulationEntryScreen() {
  const router = useRouter()
  const examTypeId = appStore((state) => state.currentExamProfile?.examTypeId)

  const { data: rule, isLoading, isError, refetch } = useQuery({
    queryKey: examScopedQueryKeys.simulationRule(examTypeId || ''),
    queryFn: ({ signal }) => remote.getRule(examTypeId || '', signal),
    enabled: !!examTypeId,
  })

  const session = useSimulationSessionStore(
    (state) => examTypeId ? state.sessions[examTypeId] : null
  )
  const hasActiveSession = session?.status === 'active' || session?.status === 'submitting'

  const handleStart = async () => {
    if (!examTypeId) return
    if (hasActiveSession) {
      Alert.alert('提示', '您有未完成的考试，重新开始将清空进度，确认重新开始吗？', [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定', 
          style: 'destructive',
          onPress: async () => {
            await simulationService.startExam(examTypeId)
            router.replace('/(protected)/simulation/exam')
          }
        },
      ])
      return
    }
    await simulationService.startExam(examTypeId)
    router.replace('/(protected)/simulation/exam')
  }

  const handleResume = () => {
    router.replace('/(protected)/simulation/exam')
  }

  const handleHistory = () => {
    router.push('/(protected)/simulation/history')
  }

  if (!examTypeId) {
    return (
      <AppScreen>
        <AppText>请先选择考试类型</AppText>
      </AppScreen>
    )
  }

  if (isLoading) {
    return (
      <AppScreen className="justify-center items-center">
        <ActivityIndicator size="large" />
      </AppScreen>
    )
  }

  if (isError || !rule) {
    return (
      <AppScreen className="justify-center items-center">
        <AppText className="mb-4">加载模拟考试规则失败</AppText>
        <AppButton onPress={() => refetch()}>重试</AppButton>
      </AppScreen>
    )
  }

  return (
    <AppScreen className="p-4">
      <View className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <AppText className="text-xl font-bold mb-4">模拟考试</AppText>
        <AppText className="text-gray-600 mb-2">
          考试时间：{Math.floor(rule.durationSeconds / 60)}分钟
        </AppText>
        <AppText className="text-gray-600 mb-4">
          题目数量：{rule.totalQuestions}题
        </AppText>

        <AppButton
          onPress={handleStart}
          className="mb-3"
        >
          {hasActiveSession ? "重新开始" : "开始考试"}
        </AppButton>
        {hasActiveSession && (
          <AppButton
            variant="outline"
            onPress={handleResume}
            className="mb-3"
          >
            继续考试
          </AppButton>
        )}
        <AppButton
          variant="ghost"
          onPress={handleHistory}
        >
          考试记录
        </AppButton>
      </View>
    </AppScreen>
  )
}

