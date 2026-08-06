import React from 'react'
import { View, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { usePracticeSessionStore } from '../state/practice-session.store'
import { practiceService } from '../application/practice.service'
import { AppText, AppScreen } from '@/shared/components'
import RenderHtml from 'react-native-render-html'
import type { QuestionOption } from '../domain/question.types'

export function PracticeSessionScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  
  const currentSession = usePracticeSessionStore((state) => state.currentSession)
  const isLoading = usePracticeSessionStore((state) => state.isLoadingQuestion)
  const questionsCache = usePracticeSessionStore((state) => state.questionsCache)

  if (!currentSession) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center">
          <AppText>练习未开始</AppText>
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mt-4 p-3 bg-primary rounded-lg"
          >
            <AppText className="text-white">返回</AppText>
          </TouchableOpacity>
        </View>
      </AppScreen>
    )
  }

  const currentQuestionId = currentSession.questionIds[currentSession.currentIndex]
  const question = currentQuestionId ? questionsCache[currentQuestionId] : undefined

  const handlePrev = () => {
    practiceService.loadPrevQuestion()
  }

  const handleNext = () => {
    practiceService.loadNextQuestion()
  }

  const handleOptionPress = (optionId: string) => {
    if (!question) return
    let newAnswers = [...question.userAnswers]
    
    if (question.type === 'single' || question.type === 'judge') {
      newAnswers = [optionId]
    } else {
      if (newAnswers.includes(optionId)) {
        newAnswers = newAnswers.filter(a => a !== optionId)
      } else {
        newAnswers.push(optionId)
      }
    }
    
    practiceService.submitAnswer(question.id, newAnswers)
  }

  const handleToggleFavorite = () => {
    if (!question) return
    practiceService.toggleFavorite(question.id)
  }

  const handleQuit = async () => {
    await practiceService.submitSession()
    router.back()
  }

  return (
    <AppScreen>
      <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={handleQuit}>
          <AppText className="text-primary text-base">退出</AppText>
        </TouchableOpacity>
        <AppText className="text-base font-bold">
          {currentSession.currentIndex + 1} / {currentSession.questionIds.length}
        </AppText>
        <TouchableOpacity onPress={handleToggleFavorite}>
          <AppText className={question?.isFavorite ? "text-yellow-500 text-base" : "text-gray-400 text-base"}>
            {question?.isFavorite ? '已收藏' : '收藏'}
          </AppText>
        </TouchableOpacity>
      </View>

      {isLoading || !question ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView className="flex-1 p-4">
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <View className="bg-primary/10 px-2 py-1 rounded">
                <AppText className="text-primary text-xs">
                  {question.type === 'single' ? '单选' : question.type === 'multiple' ? '多选' : '判断'}
                </AppText>
              </View>
            </View>
            <RenderHtml
              contentWidth={width - 32}
              source={{ html: question.stemHtml }}
              tagsStyles={{ body: { fontSize: 16, lineHeight: 24, color: '#333' } }}
            />
          </View>

          <View className="mb-8">
            {question.options.map((opt: QuestionOption) => {
              const isSelected = question.userAnswers.includes(opt.id)
              const hasAnswered = question.userAnswers.length > 0
              const answerState = currentSession.answers[question.id]
              const status = answerState?.status
              
              let optionClass = "flex-row items-center p-4 bg-white rounded-xl mb-3 border border-gray-200"

              if (isSelected) {
                optionClass = "flex-row items-center p-4 bg-primary/10 rounded-xl mb-3 border border-primary"
              }

              // Show correct/wrong if answered and synced
              if (hasAnswered && status === 'synced') {
                const isCorrect = question.correctAnswers.includes(opt.id)
                if (isCorrect) {
                  optionClass = "flex-row items-center p-4 bg-green-50 rounded-xl mb-3 border border-green-500"
                } else if (isSelected && !isCorrect) {
                  optionClass = "flex-row items-center p-4 bg-red-50 rounded-xl mb-3 border border-red-500"
                }
              }

              return (
                <TouchableOpacity 
                  key={opt.id} 
                  onPress={() => !hasAnswered && handleOptionPress(opt.id)}
                  activeOpacity={hasAnswered ? 1 : 0.7}
                  className={optionClass}
                >
                  <View className={`w-8 h-8 rounded-full items-center justify-center ${isSelected ? 'bg-primary' : 'bg-gray-100'}`}>
                    <AppText className={isSelected ? 'text-white' : 'text-gray-500'}>{opt.label}</AppText>
                  </View>
                  <RenderHtml
                    contentWidth={width - 80}
                    source={{ html: opt.content }}
                    tagsStyles={{ body: { fontSize: 16, color: isSelected ? '#3b82f6' : '#374151' } }}
                  />
                </TouchableOpacity>
              )
            })}
          </View>

          {currentSession.answers[question.id]?.status === 'pending' && (
            <View className="mb-8 items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
              <ActivityIndicator size="small" className="mb-2" />
              <AppText className="text-gray-500">答案提交中...</AppText>
            </View>
          )}

          {currentSession.answers[question.id]?.status === 'synced' && question.userAnswers.length > 0 && question.explanationHtml && (
            <View className="p-4 bg-gray-50 rounded-xl mb-8">
              <View className="flex-row items-center mb-2">
                <AppText className="text-base font-bold">答案解析</AppText>
                <AppText className={`ml-3 font-bold ${currentSession.answers[question.id]?.serverCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {currentSession.answers[question.id]?.serverCorrect ? '回答正确' : '回答错误'}
                </AppText>
              </View>
              <AppText className="text-sm mb-2 text-green-600">
                正确答案: {question.correctAnswers.join(' ')}
              </AppText>
              <RenderHtml
                contentWidth={width - 64}
                source={{ html: question.explanationHtml }}
                tagsStyles={{ body: { fontSize: 14, lineHeight: 22, color: '#4b5563' } }}
              />
            </View>
          )}

          {currentSession.answers[question.id]?.status === 'failed' && (
            <View className="mb-8 items-center bg-red-50 p-4 rounded-xl border border-red-200">
              <AppText className="text-red-600 mb-2">答案提交失败</AppText>
              <TouchableOpacity
                onPress={() => practiceService.retryAnswer(question.id)}
                className="bg-red-500 px-4 py-2 rounded-lg"
              >
                <AppText className="text-white">点击重试</AppText>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      <View className="flex-row p-4 bg-white border-t border-gray-200">
        <TouchableOpacity 
          onPress={handlePrev} 
          disabled={currentSession.currentIndex === 0}
          className={`flex-1 p-3 rounded-lg mr-2 items-center ${currentSession.currentIndex === 0 ? 'bg-gray-100' : 'bg-primary/10'}`}
        >
          <AppText className={currentSession.currentIndex === 0 ? 'text-gray-400' : 'text-primary'}>上一题</AppText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleNext} 
          disabled={currentSession.currentIndex === currentSession.questionIds.length - 1}
          className={`flex-1 p-3 rounded-lg ml-2 items-center ${currentSession.currentIndex === currentSession.questionIds.length - 1 ? 'bg-gray-100' : 'bg-primary'}`}
        >
          <AppText className={currentSession.currentIndex === currentSession.questionIds.length - 1 ? 'text-gray-400' : 'text-white'}>下一题</AppText>
        </TouchableOpacity>
      </View>
    </AppScreen>
  )
}
