/**
 * Design Token: Color Palette
 * Raw color values — use semantic-colors.ts in components.
 */
export const palette = {
  // Blues (brand primary)
  blue50: '#eff6ff',
  blue100: '#dbeafe',
  blue200: '#bfdbfe',
  blue300: '#93c5fd',
  blue400: '#60a5fa',
  blue500: '#3b82f6',
  blue600: '#2563eb',
  blue700: '#1d4ed8',
  blue800: '#1e40af',
  blue900: '#1e3a8a',

  // Neutrals
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  // Semantic
  white: '#ffffff',
  black: '#000000',

  // Feedback
  red400: '#f87171',
  red500: '#ef4444',
  red600: '#dc2626',
  green400: '#4ade80',
  green500: '#22c55e',
  green600: '#16a34a',
  yellow400: '#facc15',
  yellow500: '#eab308',
  orange500: '#f97316',

  // Transparent
  transparent: 'transparent',
} as const

export type PaletteKey = keyof typeof palette
