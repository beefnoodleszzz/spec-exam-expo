import React from 'react'
import { View, TouchableOpacity, Modal } from 'react-native'
import { AppText, AppButton } from '@/shared/components'
import { useSimulationSessionStore } from '../state/simulation-session.store'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface SimulationSubmitSheetProps {
  examTypeId: string
  visible: boolean
  onClose: () => void
  onSubmit: () => void
  remainingSeconds: number
}

function formatTime(seconds: number): string {
  if (seconds <= 0) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function SimulationSubmitSheet({
  examTypeId,
  visible,
  onClose,
  onSubmit,
  remainingSeconds,
}: SimulationSubmitSheetProps) {
  const insets = useSafeAreaInsets()
  const session = useSimulationSessionStore((state) => state.sessions[examTypeId])

  if (!session) return null

  const total = session.questionIds.length
  let answered = 0
  let markedCount = 0

  session.questionIds.forEach((qid) => {
    const ans = session.answers[qid]
    if (ans) {
      if (ans.answers.length > 0) answered++
      if (ans.marked) markedCount++
    }
  })

  const unanswered = total - answered
  const isSubmitting = session.status === 'submitting'

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View 
          className="bg-white rounded-t-2xl"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <AppText className="text-lg font-bold">交卷确认</AppText>
            <TouchableOpacity onPress={onClose} className="p-2" disabled={isSubmitting}>
              <AppText className="text-gray-500">关闭</AppText>
            </TouchableOpacity>
          </View>

          <View className="p-6 items-center">
            <AppText className="text-gray-600 mb-2">剩余时间</AppText>
            <AppText className="text-3xl font-bold text-blue-600 mb-6">
              {formatTime(remainingSeconds)}
            </AppText>

            <View className="w-full flex-row justify-around bg-gray-50 p-4 rounded-xl mb-6">
              <View className="items-center">
                <AppText className="text-gray-500 text-sm mb-1">已答</AppText>
                <AppText className="text-xl font-bold text-blue-600">{answered}</AppText>
              </View>
              <View className="items-center">
                <AppText className="text-gray-500 text-sm mb-1">未答</AppText>
                <AppText className="text-xl font-bold text-gray-800">{unanswered}</AppText>
              </View>
              <View className="items-center">
                <AppText className="text-gray-500 text-sm mb-1">标记</AppText>
                <AppText className="text-xl font-bold text-orange-500">{markedCount}</AppText>
              </View>
            </View>

            {unanswered > 0 && (
              <AppText className="text-orange-600 mb-6">
                仍有 {unanswered} 道题未作答，确定要交卷吗？
              </AppText>
            )}

            <View className="w-full flex-row space-x-4">
              <View className="flex-1 mr-2">
                <AppButton 
                  onPress={onClose} 
                  variant="outline" 
                  disabled={isSubmitting}
                >
                  继续答题
                </AppButton>
              </View>
              <View className="flex-1 ml-2">
                <AppButton 
                  onPress={onSubmit} 
                  loading={isSubmitting}
                >
                  确认交卷
                </AppButton>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}
