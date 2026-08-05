import { Platform } from 'react-native'

export const fontFamily = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    mono: 'Courier',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    mono: 'monospace',
  },
  default: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    mono: 'monospace',
  },
})

export const typography = {
  display: {
    fontSize: 28,
    lineHeight: 38,
    fontWeight: '700' as const,
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600' as const,
  },
  heading: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodySecondary: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
} as const

export type TypographyVariant = keyof typeof typography
