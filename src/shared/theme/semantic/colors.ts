import { palette } from '../primitives/palette'

export const lightSemanticColors = {
  background: palette.gray50,
  surface: palette.gray0,
  surfaceElevated: palette.gray0,

  foreground: palette.gray900,
  foregroundSecondary: palette.gray700,
  foregroundMuted: palette.gray500,
  foregroundInverse: palette.gray0,

  primary: palette.blue500,
  primaryPressed: palette.blue600,
  primarySoft: palette.blue50,
  primaryForeground: palette.gray0,

  border: palette.gray200,
  borderStrong: palette.gray300,
  divider: palette.gray100,

  success: palette.green500,
  successSoft: palette.green50,
  warning: palette.orange500,
  warningSoft: palette.orange50,
  danger: palette.red500,
  dangerSoft: palette.red50,

  questionCorrect: palette.green500,
  questionWrong: palette.red500,
  questionSelected: palette.blue500,
  questionUnanswered: palette.gray400,

  vip: palette.amber500,
  vipSoft: palette.amber50,
} as const

export type SemanticColorKey = keyof typeof lightSemanticColors
export type SemanticColors = Record<SemanticColorKey, string>
