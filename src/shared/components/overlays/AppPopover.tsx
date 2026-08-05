import React from 'react'
import { Modal, View, TouchableWithoutFeedback } from 'react-native'
import { cn } from '@/shared/utils/cn'

export interface AppPopoverProps {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function AppPopover({
  visible,
  onClose,
  children,
  className,
}: AppPopoverProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/20 justify-center items-center p-6">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View className={cn('bg-surface rounded-xl p-4 shadow-xl border border-border', className)}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}
