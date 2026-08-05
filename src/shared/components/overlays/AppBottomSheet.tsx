import React from 'react'
import { AppModal, type AppModalProps } from './AppModal'

export type AppBottomSheetProps = AppModalProps

export function AppBottomSheet(props: AppBottomSheetProps) {
  return <AppModal {...props} />
}
