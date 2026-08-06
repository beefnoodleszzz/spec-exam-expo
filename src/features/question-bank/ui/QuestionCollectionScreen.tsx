import React from 'react'
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { AppScreen, AppText, AppButton } from '@/shared/components'
import { questionBankRemote } from '../data/question-bank.remote.impl'
import { practiceService } from '../application/practice.service'
import { appStore } from '@/shared/auth/app-store'
import RenderHtml from 'react-native-render-html'

export function QuestionCollectionScreen() {
  const router = useRouter()
  const { mode } = useLocalSearchParams<{ mode: 'wrong' | 'favorite' }>()
  const examProfile = appStore(state => state.currentExamProfile)
  
  const title = mode === 'wrong' ? '错题本' : '收藏夹'
  
  const { data: seed, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['question-collection', mode, examProfile?.examTypeId],
    queryFn: async () => {
      if (!examProfile?.examTypeId) throw new Error('Missing examTypeId')
      // Note: In a real app we might need subjectId, but for now we pass empty string 
      // if subjectId is not available, as it might be cross-subject.
      const subjectId = '' 
      if (mode === 'wrong') {
        return await questionBankRemote.listWrongQuestions(examProfile.examTypeId, subjectId)
      } else {
        return await questionBankRemote.listFavoriteQuestions(examProfile.examTypeId, subjectId)
      }
    },
    enabled: !!examProfile?.examTypeId
  })
  
  const { data: questions, isLoading: isQuestionsLoading } = useQuery({
    queryKey: ['question-collection-details', seed?.questionIds],
    queryFn: async () => {
      if (!seed?.questionIds.length) return []
      // Just fetch first 50 for the list preview to avoid massive payloads
      const ids = seed.questionIds.slice(0, 50)
      return await questionBankRemote.getQuestionsByIds(ids)
    },
    enabled: !!seed?.questionIds?.length
  })

  const handleStartPractice = async () => {
    if (!examProfile?.examTypeId) return
    try {
      await practiceService.startPractice({
        examTypeId: examProfile.examTypeId,
        subjectId: '',
        mode: mode || 'wrong'
      })
      router.push('/(protected)/practice/session')
    } catch (e: unknown) {
      alert((e as Error).message || '启动练习失败')
    }
  }

  return (
    <AppScreen>
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <AppText className="text-primary text-base">返回</AppText>
        </TouchableOpacity>
        <AppText className="text-lg font-bold flex-1">{title}</AppText>
      </View>

      <View className="flex-1 bg-gray-50">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" />
            <AppText className="mt-2 text-gray-500">加载中...</AppText>
          </View>
        ) : isError ? (
          <View className="flex-1 justify-center items-center p-4">
            <AppText className="text-red-500 mb-4">{(error as Error).message || '加载失败'}</AppText>
            <AppButton onPress={() => refetch()}>重试</AppButton>
          </View>
        ) : !seed || seed.questionIds.length === 0 ? (
          <View className="flex-1 justify-center items-center p-4">
            <AppText className="text-gray-500 mb-4">暂无{title}</AppText>
          </View>
        ) : (
          <>
            <View className="p-4 bg-white mb-2">
              <AppText className="text-gray-600 mb-2">共 {seed.questionIds.length} 道题目</AppText>
              <AppButton onPress={handleStartPractice}>开始练习</AppButton>
            </View>
            
            {isQuestionsLoading ? (
              <ActivityIndicator className="mt-4" />
            ) : (
              <FlatList
                data={questions}
                keyExtractor={q => q.id}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item, index }) => (
                  <View className="bg-white p-4 rounded-xl mb-4 border border-gray-200">
                    <View className="flex-row items-center mb-2">
                      <AppText className="text-gray-500 mr-2">{index + 1}.</AppText>
                      <View className="bg-primary/10 px-2 py-1 rounded">
                        <AppText className="text-primary text-xs">
                          {item.type === 'single' ? '单选' : item.type === 'multiple' ? '多选' : '判断'}
                        </AppText>
                      </View>
                    </View>
                    <RenderHtml 
                      contentWidth={300}
                      source={{ html: item.stemHtml }}
                      tagsStyles={{ body: { fontSize: 14, color: '#333' } }}
                    />
                  </View>
                )}
              />
            )}
          </>
        )}
      </View>
    </AppScreen>
  )
}
