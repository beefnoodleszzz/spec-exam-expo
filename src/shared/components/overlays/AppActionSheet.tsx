import React from 'react'
import { Modal, View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import { AppText } from '../primitives/AppText'
import { cn } from '@/shared/utils/cn'

export interface ActionSheetOption {
  label: string
  onPress: () => void
  destructive?: boolean
}

export interface AppActionSheetProps {
  visible: boolean
  onClose: () => void
  title?: string
  options: ActionSheetOption[]
  cancelText?: string
}

export function AppActionSheet({
  visible,
  onClose,
  title,
  options,
  cancelText = '取消',
}: AppActionSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-end p-4">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View className="w-full">
              <View className="bg-surface rounded-2xl overflow-hidden mb-3">
                {title && (
                  <View className="px-4 py-3 border-b border-divider items-center">
                    <AppText variant="caption" tone="muted">
                      {title}
                    </AppText>
                  </View>
                )}
                {options.map((opt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.7}
                    onPress={() => {
                      opt.onPress()
                      onClose()
                    }}
                    className={cn(
                      'py-4 px-4 items-center border-b border-divider active:bg-gray-100',
                      idx === options.length - 1 && 'border-b-0',
                    )}
                  >
                    <AppText
                      variant="body"
                      tone={opt.destructive ? 'danger' : 'primary'}
                      className="font-medium"
                    >
                      {opt.label}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                className="bg-surface rounded-2xl py-4 items-center active:bg-gray-100 mb-2"
              >
                <AppText variant="body" className="font-semibold">
                  {cancelText}
                </AppText>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}
