/**
 * Design Token: Semantic Colors
 * Map palette to UI roles. Supports light mode only for now.
 * Dark mode can be layered on top later.
 */
import { palette } from './colors'

export const semanticColors = {
  // Brand
  primary: palette.blue600,
  primaryLight: palette.blue100,
  primaryDark: palette.blue800,

  // Backgrounds
  background: palette.gray50,
  surface: palette.white,
  surfaceElevated: palette.white,
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Borders
  border: palette.gray200,
  borderStrong: palette.gray300,

  // Text
  textPrimary: palette.gray900,
  textSecondary: palette.gray500,
  textDisabled: palette.gray400,
  textInverse: palette.white,
  textLink: palette.blue600,

  // Feedback
  error: palette.red500,
  errorBackground: '#fef2f2',
  success: palette.green500,
  successBackground: '#f0fdf4',
  warning: palette.yellow500,
  warningBackground: '#fefce8',
  info: palette.blue500,
  infoBackground: palette.blue50,

  // Answer states
  correct: palette.green500,
  correctBackground: '#f0fdf4',
  wrong: palette.red500,
  wrongBackground: '#fef2f2',
  unanswered: palette.gray300,

  // Tab bar
  tabActive: palette.blue600,
  tabInactive: palette.gray400,

  // Membership / VIP
  vip: '#d97706',
  vipBackground: '#fffbeb',
} as const

export type SemanticColorKey = keyof typeof semanticColors
