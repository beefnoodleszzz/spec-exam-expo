import React from 'react'
import { AppLoading } from '@/shared/components/feedback/AppLoading'

export function BootstrapLoadingScreen() {
  return <AppLoading message="正在重新加载基础配置..." fullScreen={true} />
}
