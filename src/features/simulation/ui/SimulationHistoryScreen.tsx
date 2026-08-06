import React from 'react'
import { View, FlatList, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'


import { AppScreen, AppText } from '@/shared/components'

import { appStore } from '@/shared/auth/app-store'
import { examScopedQueryKeys } from '@/shared/query/exam-scoped-query-keys'
import { SimulationRemoteImpl } from '../data/simulation.remote.impl'
import type { SimulationHistoryItem } from '../domain/simulation-history.types'

const remote = new SimulationRemoteImpl()

export function SimulationHistoryScreen() {
  const examTypeId = appStore((state) => state.currentExamProfile?.examTypeId)

  const { data: historyItems, isLoading, isError } = useQuery({
    queryKey: examScopedQueryKeys.simulationHistory(examTypeId || ''),
    queryFn: ({ signal }) => remote.listHistory(examTypeId || '', signal),
    enabled: !!examTypeId,
  })

  const renderItem = ({ item }: { item: SimulationHistoryItem }) => (
    <View className="bg-white p-4 mb-3 rounded-xl shadow-sm flex-row justify-between items-center">
      <View className="flex-1">
        <AppText className="text-gray-500 mb-1">{item.createdAt}</AppText>
        <AppText className="text-base font-bold mb-1">{item.title}</AppText>
        <AppText className="text-sm text-gray-500">
          用时：{Math.floor(item.durationSeconds / 60)}分{(item.durationSeconds % 60).toString().padStart(2, '0')}秒
        </AppText>
      </View>
      <View className="items-end">
        <AppText className={`text-2xl font-bold ${item.passed ? 'text-green-500' : 'text-red-500'}`}>
          {item.score}分
        </AppText>
        <AppText className={`text-sm ${item.passed ? 'text-green-500' : 'text-red-500'}`}>
          {item.passed ? '合格' : '不合格'}
        </AppText>
      </View>
    </View>
  )

  if (!examTypeId) {
    return (
      <AppScreen className="justify-center items-center">
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

  if (isError) {
    return (
      <AppScreen className="justify-center items-center">
        <AppText className="mb-4">加载历史记录失败</AppText>
      </AppScreen>
    )
  }

  return (
    <AppScreen className="p-4">
      <FlatList
        data={historyItems || []}
        keyExtractor={(item) => item.resultId}
        renderItem={renderItem}
        ListEmptyComponent={
          <View className="py-8 items-center">
            <AppText className="text-gray-500">暂无模拟考试记录</AppText>
          </View>
        }
      />
    </AppScreen>
  )
}
