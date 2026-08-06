import React, { useState } from 'react'
import { View, TouchableOpacity, FlatList } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery, useMutation } from '@tanstack/react-query'

import { AppScreen } from '@/shared/components/layout/AppScreen'
import { AppText } from '@/shared/components/primitives/AppText'
import { AppButton } from '@/shared/components/actions/AppButton'
import { AppCard } from '@/shared/components/layout/AppCard'
import { AppLoading } from '@/shared/components/feedback/AppLoading'
import { AppErrorState } from '@/shared/components/feedback/AppErrorState'
import { AppEmptyState } from '@/shared/components/feedback/AppEmptyState'
import { getErrorMessage } from '@/shared/api/errors/app-error'

import { examProfileService } from '../application/exam-profile.service'
import type { ExamTypeOption } from '../domain/exam-profile.types'

export function ExamProfileSelectionScreen() {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const {
    data: examTypes,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['examTypes'],
    queryFn: ({ signal }) => examProfileService.listExamTypes(signal),
  })

  const mutation = useMutation({
    mutationFn: async (option: ExamTypeOption) => {
      await examProfileService.switchExamProfile({
        examTypeId: option.id,
        examTypeName: option.name,
        province: null,
        provinceCode: null,
        inviteCode: null,
      })
    },
    onSuccess: () => {
      router.replace('/(protected)/(tabs)')
    },
  })

  const handleConfirm = () => {
    if (!selectedId || !examTypes) return
    const option = examTypes.find((t) => t.id === selectedId)
    if (option) {
      mutation.mutate(option)
    }
  }

  if (isLoading) {
    return (
      <AppScreen>
        <AppLoading message="正在加载考试类型..." />
      </AppScreen>
    )
  }

  if (error) {
    return (
      <AppScreen>
        <AppErrorState
          message={getErrorMessage(error)}
          onRetry={refetch}
        />
      </AppScreen>
    )
  }

  if (!examTypes || examTypes.length === 0) {
    return (
      <AppScreen>
        <AppEmptyState
          title="暂无数据"
          description="当前没有可用的考试类型"
          actionLabel="重试"
          onAction={refetch}
        />
      </AppScreen>
    )
  }

  return (
    <AppScreen>
      <View className="p-5">
        <AppText variant="title">请选择考试类型</AppText>
        <AppText variant="body" tone="secondary" className="mt-2">
          选择后将为您推荐相关题库与课程
        </AppText>
      </View>

      <FlatList
        data={examTypes}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-5 pb-5"
        renderItem={({ item }) => {
          const isSelected = item.id === selectedId
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSelectedId(item.id)}
              className="mb-3"
            >
              <AppCard
                className={`p-4 border ${
                  isSelected ? 'border-primary bg-primary/10' : 'border-transparent bg-surface'
                }`}
              >
                <AppText
                  variant={isSelected ? 'heading' : 'body'}
                  tone={isSelected ? 'primary' : 'default'}
                >
                  {item.name}
                </AppText>
              </AppCard>
            </TouchableOpacity>
          )
        }}
      />

      <View className="p-5 pb-10">
        <AppButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selectedId || mutation.isPending}
          loading={mutation.isPending}
          onPress={handleConfirm}
        >
          确认选择
        </AppButton>
      </View>
    </AppScreen>
  )
}
