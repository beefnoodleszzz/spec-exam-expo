import React from 'react'
import { View } from 'react-native'
import { cn } from '@/shared/utils/cn'

export interface AppStackProps {
  direction?: 'row' | 'column'
  spacing?: 1 | 2 | 3 | 4 | 5 | 6 | 8
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  className?: string
  children: React.ReactNode
}

const spacingClasses = {
  row: {
    1: 'space-x-1',
    2: 'space-x-2',
    3: 'space-x-3',
    4: 'space-x-4',
    5: 'space-x-5',
    6: 'space-x-6',
    8: 'space-x-8',
  },
  column: {
    1: 'space-y-1',
    2: 'space-y-2',
    3: 'space-y-3',
    4: 'space-y-4',
    5: 'space-y-5',
    6: 'space-y-6',
    8: 'space-y-8',
  },
}

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
}

export function AppStack({
  direction = 'column',
  spacing = 3,
  align = 'stretch',
  justify = 'start',
  className,
  children,
}: AppStackProps) {
  return (
    <View
      className={cn(
        direction === 'row' ? 'flex-row' : 'flex-col',
        spacingClasses[direction][spacing],
        alignClasses[align],
        justifyClasses[justify],
        className,
      )}
    >
      {children}
    </View>
  )
}
