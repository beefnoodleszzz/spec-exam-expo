import React from 'react'
import { View, ScrollView, TouchableOpacity, Modal } from 'react-native'
import { AppText } from '@/shared/components'
import { useSimulationSessionStore } from '../state/simulation-session.store'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface SimulationAnswerCardProps {
  examTypeId: string
  visible: boolean
  onClose: () => void
}

export function SimulationAnswerCard({
  examTypeId,
  visible,
  onClose,
}: SimulationAnswerCardProps) {
  const insets = useSafeAreaInsets()
  const session = useSimulationSessionStore((state) => state.sessions[examTypeId])
  const updateCurrentIndex = useSimulationSessionStore((state) => state.updateCurrentIndex)

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

  const handleSelect = (index: number) => {
    updateCurrentIndex(examTypeId, index)
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View 
          className="bg-white rounded-t-2xl"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <AppText className="text-lg font-bold">答题卡</AppText>
            <TouchableOpacity onPress={onClose} className="p-2">
              <AppText className="text-gray-500">关闭</AppText>
            </TouchableOpacity>
          </View>

          <ScrollView className="max-h-[60vh] p-4">
            <View className="flex-row flex-wrap -mx-1">
              {session.questionIds.map((qid, index) => {
                const ans = session.answers[qid]
                const isCurrent = index === session.currentIndex
                const isAnswered = ans && ans.answers.length > 0
                const isMarked = ans && ans.marked

                let bgClass = 'bg-gray-100'
                let textClass = 'text-gray-700'
                let borderClass = 'border-transparent'

                if (isCurrent) {
                  borderClass = 'border-blue-500 border-2'
                }

                if (isMarked) {
                  bgClass = 'bg-orange-100'
                  textClass = 'text-orange-600'
                } else if (isAnswered) {
                  bgClass = 'bg-blue-100'
                  textClass = 'text-blue-600'
                }

                return (
                  <TouchableOpacity
                    key={qid}
                    className={`w-1/6 p-1`}
                    onPress={() => handleSelect(index)}
                  >
                    <View
                      className={`h-10 w-full items-center justify-center rounded-full ${bgClass} ${borderClass}`}
                    >
                      <AppText className={`font-medium ${textClass}`}>
                        {index + 1}
                      </AppText>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>

          <View className="flex-row justify-between p-4 border-t border-gray-200 bg-gray-50">
            <View className="items-center flex-1 border-r border-gray-200">
              <AppText className="text-xs text-gray-500">已答</AppText>
              <AppText className="text-lg font-bold text-blue-600">{answered}</AppText>
            </View>
            <View className="items-center flex-1 border-r border-gray-200">
              <AppText className="text-xs text-gray-500">未答</AppText>
              <AppText className="text-lg font-bold text-gray-600">{unanswered}</AppText>
            </View>
            <View className="items-center flex-1">
              <AppText className="text-xs text-gray-500">标记</AppText>
              <AppText className="text-lg font-bold text-orange-600">{markedCount}</AppText>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}
