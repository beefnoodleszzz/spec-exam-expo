import React from 'react'
import { Modal, View, TouchableWithoutFeedback } from 'react-native'
import { AppText } from '../primitives/AppText'
import { AppButton } from '../actions/AppButton'
import { cn } from '@/shared/utils/cn'

export interface AppDialogProps {
  visible: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  confirmVariant?: 'primary' | 'danger'
  loading?: boolean
  className?: string
}

export function AppDialog({
  visible,
  title,
  description,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
  confirmVariant = 'primary',
  loading = false,
  className,
}: AppDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              className={cn(
                'w-full max-w-[340px] bg-surface rounded-2xl p-5 shadow-xl',
                className,
              )}
            >
              <AppText variant="heading" align="center" className="mb-2 font-bold">
                {title}
              </AppText>
              {description && (
                <AppText
                  variant="body-secondary"
                  tone="secondary"
                  align="center"
                  className="mb-5"
                >
                  {description}
                </AppText>
              )}

              <View className="flex-row items-center justify-between space-x-3 mt-2">
                {cancelText && onCancel && (
                  <View className="flex-1">
                    <AppButton
                      variant="secondary"
                      size="md"
                      fullWidth
                      disabled={loading}
                      onPress={onCancel}
                    >
                      {cancelText}
                    </AppButton>
                  </View>
                )}
                {confirmText && onConfirm && (
                  <View className="flex-1">
                    <AppButton
                      variant={confirmVariant}
                      size="md"
                      fullWidth
                      loading={loading}
                      onPress={() => void onConfirm()}
                    >
                      {confirmText}
                    </AppButton>
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}
