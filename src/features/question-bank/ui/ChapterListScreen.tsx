import React from 'react'
import { View, SectionList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { questionBankQueries } from '../application/queries'
import { practiceService } from '../application/practice.service'
import { appStore } from '@/shared/auth/app-store'
import { AppText, AppScreen } from '@/shared/components'
import type { Chapter } from '../domain/chapter.types'

export function ChapterListScreen() {
  const router = useRouter()
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>()
  const examTypeId = appStore((state) => state.currentExamProfile?.examTypeId)

  const { data: chapters, isLoading, isError, refetch } = useQuery(
    questionBankQueries.chapters(subjectId || '')
  )

  const handleStartPractice = async (chapter: Chapter) => {
    if (!examTypeId || !subjectId) return

    try {
      await practiceService.startPractice({
        examTypeId,
        subjectId,
        chapterId: chapter.id,
        mode: 'order', // Default to order for chapters
      })
      router.push('/(protected)/practice/session')
    } catch (e: unknown) {
      alert((e as Error).message || '启动练习失败')
    }
  }

  if (!subjectId) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <AppText className="text-gray-500">参数错误</AppText>
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

  if (!chapters || chapters.length === 0) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <AppText className="text-gray-500">暂无章节数据</AppText>
        </View>
      </AppScreen>
    )
  }

  // Format into sections if chapters have children
  const sections = chapters.map(ch => ({
    title: ch.name,
    data: ch.children && ch.children.length > 0 ? ch.children : [ch],
  }))

  return (
    <AppScreen>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.id + index}
        contentContainerStyle={{ padding: 16 }}
        renderSectionHeader={({ section: { title } }) => (
          <AppText className="text-xl font-bold mb-3 mt-4 text-gray-800">{title}</AppText>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleStartPractice(item)}
            className="bg-white p-4 rounded-xl mb-3 shadow-sm border-l-4 border-primary"
          >
            <View className="flex-row justify-between items-center">
              <AppText className="text-base font-medium flex-1 mr-2">{item.name}</AppText>
              <View className="bg-primary-50 px-2 py-1 rounded-full">
                <AppText className="text-primary text-xs">开始练习</AppText>
              </View>
            </View>
            <View className="mt-2 flex-row justify-between">
              <AppText className="text-gray-400 text-sm">已做: {item.answeredCount}</AppText>
              <AppText className="text-gray-400 text-sm">共: {item.questionCount}题</AppText>
            </View>
          </TouchableOpacity>
        )}
      />
    </AppScreen>
  )
}
