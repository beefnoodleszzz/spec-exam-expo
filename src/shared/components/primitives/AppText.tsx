import React from 'react'
import { Text as RNText, type TextProps as RNTextProps } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/utils/cn'

const textVariants = cva('', {
  variants: {
    variant: {
      display: 'text-[28px] leading-[38px] font-bold',
      title: 'text-[22px] leading-[30px] font-semibold',
      heading: 'text-[18px] leading-[26px] font-semibold',
      body: 'text-[16px] leading-[24px] font-normal',
      'body-secondary': 'text-[14px] leading-[22px] font-normal',
      caption: 'text-[12px] leading-[18px] font-normal',
      label: 'text-[14px] leading-[20px] font-medium',
    },
    tone: {
      default: 'text-foreground',
      secondary: 'text-foreground-secondary',
      muted: 'text-foreground-muted',
      primary: 'text-primary',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
      inverse: 'text-foreground-inverse',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    variant: 'body',
    tone: 'default',
    align: 'left',
  },
})

export interface AppTextProps
  extends RNTextProps,
    VariantProps<typeof textVariants> {
  className?: string
  children?: React.ReactNode
}

export function AppText({
  variant,
  tone,
  align,
  className,
  children,
  ...props
}: AppTextProps) {
  return (
    <RNText
      className={cn(textVariants({ variant, tone, align }), className)}
      allowFontScaling={true}
      {...props}
    >
      {children}
    </RNText>
  )
}
