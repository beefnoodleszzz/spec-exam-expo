import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator, Alert, SafeAreaView, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import RenderHtml from 'react-native-render-html'

import { AppScreen, AppText, AppButton } from '@/shared/components'

import { appStore } from '@/shared/auth/app-store'
import { useSimulationSessionStore } from '../state/simulation-session.store'
import { simulationService } from '../application/simulation.service'

import { questionBankRemote } from '@/features/question-bank/data/question-bank.remote.impl'
import type { QuestionOption } from '@/features/question-bank/domain/question.types'

function useCountdown(examTypeId: string) {
  const [remaining, setRemaining] = useState(() => simulationService.getRemainingSeconds(examTypeId))

  useEffect(() => {
    const interval = setInterval(() => {
      const remainingSeconds = simulationService.getRemainingSeconds(examTypeId)
      setRemaining(remainingSeconds)
      if (remainingSeconds <= 0) {
        clearInterval(interval)
        simulationService.handleTimeout(examTypeId)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [examTypeId])

  return remaining
}

export function SimulationExamScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const examTypeId = appStore((state) => state.currentExamProfile?.examTypeId)
  
  const session = useSimulationSessionStore(
    (state) => examTypeId ? state.sessions[examTypeId] : null
  )

  const remaining = useCountdown(examTypeId || '')

  useEffect(() => {
    if (!session || session.status === 'submitted') {
      router.replace('/(protected)/simulation/entry')
    } else if (session.status === 'expired') {
      Alert.alert('提示', '考试已结束，请交卷', [
        { text: '交卷', onPress: () => handleSubmit() }
      ])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.status, router])

  const handleSubmit = async () => {
    if (!examTypeId) return
    try {
      await simulationService.submitPaper(examTypeId)
      router.replace('/(protected)/simulation/result')
    } catch {
      Alert.alert('交卷失败', '网络错误，请重试')
    }
  }

  const confirmSubmit = () => {
    Alert.alert('确认交卷', '交卷后不可修改，确认交卷吗？', [
      { text: '取消', style: 'cancel' },
      { text: '交卷', onPress: handleSubmit, style: 'destructive' }
    ])
  }

  const currentQuestionId = session?.questionIds[session.currentIndex]

  const { data: questions, isLoading } = useQuery({
    queryKey: ['simulationQuestion', currentQuestionId],
    queryFn: ({ signal }) => questionBankRemote.getQuestionsByIds([currentQuestionId || ''], signal),
    enabled: !!currentQuestionId,
    staleTime: Infinity,
  })

  const question = questions?.[0]

  const handleOptionPress = (optionId: string) => {
    if (!examTypeId || !question) return
    
    const currentAnswerState = session?.answers[question.id] || { answers: [], marked: false, updatedAt: '' }
    let newAnswers = [...currentAnswerState.answers]
    
    if (question.type === 'single' || question.type === 'judge') {
      newAnswers = [optionId]
    } else {
      if (newAnswers.includes(optionId)) {
        newAnswers = newAnswers.filter(a => a !== optionId)
      } else {
        newAnswers.push(optionId)
      }
    }
    
    useSimulationSessionStore.getState().updateAnswer(examTypeId, question.id, newAnswers)
  }

  const handleToggleMark = () => {
    if (!examTypeId || !question) return
    useSimulationSessionStore.getState().toggleMark(examTypeId, question.id)
  }

  if (!examTypeId || !session) {
    return (
      <AppScreen className="justify-center items-center">
        <ActivityIndicator size="large" />
      </AppScreen>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View className="flex-row justify-between p-4 border-b border-gray-200">
        <AppText className={remaining < 60 ? "text-red-500 font-bold" : "text-black"}>
          {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, '0')}
        </AppText>
        <AppText>
          {session.currentIndex + 1} / {session.questionIds.length}
        </AppText>
        <TouchableOpacity onPress={confirmSubmit}>
          <AppText className="text-blue-600 font-bold">交卷</AppText>
        </TouchableOpacity>
      </View>
      
      {isLoading || !question ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView className="flex-1 p-4">
          <View className="mb-6 flex-row justify-between items-start">
            <View className="flex-1">
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
            <TouchableOpacity onPress={handleToggleMark} className="ml-4 p-2 bg-gray-50 rounded-lg">
              <AppText className={session.answers[question.id]?.marked ? "text-yellow-500 font-bold" : "text-gray-400"}>
                {session.answers[question.id]?.marked ? '已标记' : '标记'}
              </AppText>
            </TouchableOpacity>
          </View>

          <View className="mb-8">
            {question.options.map((opt: QuestionOption) => {
              const currentAnswerState = session.answers[question.id] || { answers: [] as string[] }
              const isSelected = currentAnswerState.answers.includes(opt.id)
              
              let optionClass = "flex-row items-center p-4 bg-white rounded-xl mb-3 border border-gray-200"

              if (isSelected) {
                optionClass = "flex-row items-center p-4 bg-primary/10 rounded-xl mb-3 border border-primary"
              }

              return (
                <TouchableOpacity 
                  key={opt.id} 
                  onPress={() => handleOptionPress(opt.id)}
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
        </ScrollView>
      )}

      <View className="flex-row p-4 border-t border-gray-200">
        <AppButton 
          onPress={() => useSimulationSessionStore.getState().updateCurrentIndex(examTypeId, session.currentIndex - 1)}
          disabled={session.currentIndex === 0}
          className={`flex-1 p-3 rounded-lg mr-2 items-center ${session.currentIndex === 0 ? 'bg-gray-100' : 'bg-primary/10'}`}
        >
          <AppText className={session.currentIndex === 0 ? 'text-gray-400' : 'text-primary'}>上一题</AppText>
        </AppButton>
        
        <AppButton 
          onPress={() => useSimulationSessionStore.getState().updateCurrentIndex(examTypeId, session.currentIndex + 1)}
          disabled={session.currentIndex === session.questionIds.length - 1}
          className={`flex-1 p-3 rounded-lg ml-2 items-center ${session.currentIndex === session.questionIds.length - 1 ? 'bg-gray-100' : 'bg-primary'}`}
        >
          <AppText className={session.currentIndex === session.questionIds.length - 1 ? 'text-gray-400' : 'text-white'}>下一题</AppText>
        </AppButton>
      </View>
    </SafeAreaView>
  )
}

