import React from 'react'
import { Modal, View, TouchableWithoutFeedback } from 'react-native'
import { AppHeader } from '../layout/AppHeader'
import { cn } from '@/shared/utils/cn'

export interface AppModalProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function AppModal({
  visible,
  onClose,
  title,
  children,
  className,
}: AppModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              className={cn(
                'bg-surface rounded-t-3xl max-h-[85%] pb-8 shadow-2xl',
                className,
              )}
            >
              {title && <AppHeader title={title} onBack={onClose} showBack={true} />}
              <View className="p-4">{children}</View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}
