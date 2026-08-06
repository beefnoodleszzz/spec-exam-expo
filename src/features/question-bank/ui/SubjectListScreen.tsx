import React from 'react'
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { questionBankQueries } from '../application/queries'
import { appStore } from '@/shared/auth/app-store'
import { AppText, AppScreen } from '@/shared/components'
import type { Subject } from '../domain/subject.types'

export function SubjectListScreen() {
  const router = useRouter()
  const examTypeId = appStore((state) => state.currentExamProfile?.examTypeId)

  const { data: subjects, isLoading, isError, refetch } = useQuery(

    questionBankQueries.subjects(examTypeId || '')
  )

  const handlePress = (subject: Subject) => {
    // If it has questions or children, navigate to chapters. 
    // In legacy, subjects might directly be practiced or we navigate to chapters.
    // Let's go to chapters screen and pass subjectId
    router.push({
      pathname: '/(protected)/practice/chapters',
      params: { subjectId: subject.id, subjectName: subject.name }
    })
  }

  if (!examTypeId) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <AppText className="text-gray-500">请先选择考试类型</AppText>
        </View>
      </AppScreen>
    )
  }

  if (isLoading) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </AppScreen>
    )
  }

  if (isError) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <AppText className="text-red-500 mb-4">加载失败</AppText>
          <TouchableOpacity onPress={() => refetch()} className="bg-primary px-4 py-2 rounded-lg">
            <AppText className="text-white">重试</AppText>
          </TouchableOpacity>
        </View>
      </AppScreen>
    )
  }

  if (!subjects || subjects.length === 0) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <AppText className="text-gray-500">暂无科目数据</AppText>
        </View>
      </AppScreen>
    )
  }

  return (
    <AppScreen>
      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePress(item)}
            className="bg-white p-4 rounded-xl mb-4 shadow-sm"
          >
            <View className="flex-row justify-between items-center">
              <AppText className="text-lg font-medium">{item.name}</AppText>
              {item.questionCount != null && (
                <AppText className="text-gray-500 text-sm">{item.questionCount}题</AppText>
              )}
            </View>
            {item.progress && (
              <View className="mt-2 flex-row justify-between">
                <AppText className="text-gray-400 text-sm">已做: {item.progress.answered}</AppText>
                <AppText className="text-gray-400 text-sm">正确率: {item.progress.total ? Math.round((item.progress.correct / item.progress.total) * 100) : 0}%</AppText>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </AppScreen>
  )
}
