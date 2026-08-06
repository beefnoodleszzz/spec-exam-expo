import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator, Alert, SafeAreaView, TouchableOpacity, ScrollView, useWindowDimensions, AppState } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import RenderHtml from 'react-native-render-html'

import { AppScreen, AppText, AppButton } from '@/shared/components'

import { appStore } from '@/shared/auth/app-store'
import { useSimulationSessionStore } from '../state/simulation-session.store'
import { simulationService } from '../application/simulation.service'
import { SimulationAnswerCard } from './SimulationAnswerCard'
import { SimulationSubmitSheet } from './SimulationSubmitSheet'

import { questionBankRemote } from '@/features/question-bank/data/question-bank.remote.impl'
import type { QuestionOption } from '@/features/question-bank/domain/question.types'

function useCountdown(examTypeId: string) {
  const [remaining, setRemaining] = useState(() => simulationService.getRemainingSeconds(examTypeId))

  useEffect(() => {
    const updateTime = () => {
      const remainingSeconds = simulationService.getRemainingSeconds(examTypeId)
      setRemaining(remainingSeconds)
      if (remainingSeconds <= 0) {
        simulationService.handleTimeout(examTypeId)
      }
    }

    const interval = setInterval(updateTime, 1000)
    
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        updateTime()
      }
    })

    return () => {
      clearInterval(interval)
      subscription.remove()
    }
  }, [examTypeId])

  return remaining
}

export function SimulationExamScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const [answerCardVisible, setAnswerCardVisible] = useState(false)
  const [submitSheetVisible, setSubmitSheetVisible] = useState(false)
  const examTypeId = appStore((state) => state.currentExamProfile?.examTypeId)
  
  const session = useSimulationSessionStore(
    (state) => examTypeId ? state.sessions[examTypeId] : null
  )

  const remaining = useCountdown(examTypeId || '')

  useEffect(() => {
    if (!session || session.status === 'submitted') {
      router.replace('/(protected)/simulation/entry')
    } else if (session.status === 'expired' || session.status === 'submit_failed') {
      if (!submitSheetVisible) {
        Alert.alert('提示', '交卷失败或超时，请重新提交', [
          { text: '交卷', onPress: () => setSubmitSheetVisible(true) }
        ])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.status, router])

  const handleSubmit = async () => {
    if (!examTypeId) return
    try {
      await simulationService.submitPaper(examTypeId, 'manual')
      setSubmitSheetVisible(false)
      router.replace('/(protected)/simulation/result')
    } catch {
      Alert.alert('交卷失败', '网络错误，请重试')
    }
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
    if (!examTypeId || !question || session?.status === 'submit_failed') return
    
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
    simulationService.scheduleSave(examTypeId)
  }

  const handleToggleMark = () => {
    if (!examTypeId || !question || session?.status === 'submit_failed') return
    useSimulationSessionStore.getState().toggleMark(examTypeId, question.id)
    simulationService.scheduleSave(examTypeId)
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
        <View className="flex-row items-center">
          <AppText className={remaining < 60 ? "text-red-500 font-bold mr-4" : "text-black mr-4"}>
            {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, '0')}
          </AppText>
          <TouchableOpacity onPress={() => setAnswerCardVisible(true)}>
            <AppText className="text-blue-600">答题卡</AppText>
          </TouchableOpacity>
        </View>
        <AppText>
          {session.currentIndex + 1} / {session.questionIds.length}
        </AppText>
        <TouchableOpacity onPress={() => setSubmitSheetVisible(true)}>
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

      <SimulationAnswerCard
        examTypeId={examTypeId}
        visible={answerCardVisible}
        onClose={() => setAnswerCardVisible(false)}
      />

      <SimulationSubmitSheet
        examTypeId={examTypeId}
        visible={submitSheetVisible}
        onClose={() => setSubmitSheetVisible(false)}
        onSubmit={handleSubmit}
        remainingSeconds={remaining}
      />
    </SafeAreaView>
  )
}

