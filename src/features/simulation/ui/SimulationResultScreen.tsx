import React from 'react'
import { View, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'

import { AppScreen, AppText, AppButton } from '@/shared/components'

import { useSimulationSessionStore } from '../state/simulation-session.store'
import { simulationService } from '../application/simulation.service'
import { appStore } from '@/shared/auth/app-store'

export function SimulationResultScreen() {
  const router = useRouter()
  const examTypeId = appStore((state) => state.currentExamProfile?.examTypeId)
  const result = useSimulationSessionStore((state) => state.lastResult)

  const handleFinish = () => {
    if (examTypeId) {
      simulationService.finishExam(examTypeId)
    }
    useSimulationSessionStore.getState().setLastResult(null)
    router.replace('/(protected)/simulation/entry')
  }

  if (!result) {
    return (
      <AppScreen className="justify-center items-center p-4">
        <AppText className="mb-4">暂无成绩数据</AppText>
        <AppButton onPress={handleFinish}>返回</AppButton>
      </AppScreen>
    )
  }

  const {
    score,
    correctCount,
    wrongCount,
    unansweredCount,
    passed,
    durationSeconds
  } = result

  return (
    <AppScreen className="p-4">
      <ScrollView>
        <View className="bg-white rounded-xl p-6 mb-6 items-center shadow-sm">
          <AppText className="text-xl font-bold mb-2">考试得分</AppText>
          <AppText className={`text-5xl font-bold mb-4 ${passed ? 'text-green-500' : 'text-red-500'}`}>
            {score}分
          </AppText>
          <AppText className={`text-lg font-bold ${passed ? 'text-green-500' : 'text-red-500'}`}>
            {passed ? '考试合格' : '考试不合格'}
          </AppText>
        </View>

        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <View className="flex-row justify-between py-2 border-b border-gray-100">
            <AppText className="text-gray-500">答对题目</AppText>
            <AppText className="font-bold text-green-500">{correctCount}题</AppText>
          </View>
          <View className="flex-row justify-between py-2 border-b border-gray-100">
            <AppText className="text-gray-500">答错题目</AppText>
            <AppText className="font-bold text-red-500">{wrongCount}题</AppText>
          </View>
          <View className="flex-row justify-between py-2 border-b border-gray-100">
            <AppText className="text-gray-500">未做题目</AppText>
            <AppText className="font-bold">{unansweredCount}题</AppText>
          </View>
          <View className="flex-row justify-between py-2">
            <AppText className="text-gray-500">用时</AppText>
            <AppText className="font-bold">
              {Math.floor(durationSeconds / 60)}分{(durationSeconds % 60).toString().padStart(2, '0')}秒
            </AppText>
          </View>
        </View>

        <AppButton onPress={handleFinish}>完成</AppButton>
      </ScrollView>
    </AppScreen>
  )
}
