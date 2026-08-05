import React, { createContext, useContext, useState, useCallback } from 'react'
import { View, Animated } from 'react-native'
import { AppText } from '../primitives/AppText'
import { AppIcon, type IconName } from '../primitives/AppIcon'

export type ToastType = 'info' | 'success' | 'warning' | 'danger'

export interface ToastOptions {
  message: string
  type?: ToastType
  durationMs?: number
}

interface ToastContextType {
  showToast: (options: ToastOptions | string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const toastIcons: Record<ToastType, IconName> = {
  info: 'information-circle',
  success: 'checkmark-circle',
  warning: 'warning',
  danger: 'alert-circle',
}

const toastColors: Record<ToastType, string> = {
  info: '#1677FF',
  success: '#00B42A',
  warning: '#FF7D00',
  danger: '#F53F3F',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null)
  const [fadeAnim] = useState(new Animated.Value(0))

  const showToast = useCallback((options: ToastOptions | string) => {
    const opts: ToastOptions =
      typeof options === 'string' ? { message: options } : options

    setToast(opts)
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(opts.durationMs || 2500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null)
    })
  }, [fadeAnim])

  const type = toast?.type || 'info'

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="absolute top-14 left-4 right-4 items-center justify-center z-50 pointer-events-none"
        >
          <View className="flex-row items-center px-4 py-3 bg-surface rounded-full shadow-lg border border-border max-w-sm">
            <AppIcon name={toastIcons[type]} size={20} color={toastColors[type]} />
            <AppText variant="body-secondary" className="ml-2.5 font-medium">
              {toast.message}
            </AppText>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
