export const radius = {
  none: 0,
  sm: 4,
  default: 8,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  pill: 999,
  full: 9999,
} as const

export type RadiusKey = keyof typeof radius
