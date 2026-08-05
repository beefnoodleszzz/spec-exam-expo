import { palette } from './primitives/palette'
import { spacing } from './primitives/spacing'
import { typography } from './primitives/typography'
import { radius } from './primitives/radius'
import { shadows } from './primitives/shadows'
import { motion } from './primitives/motion'
import { lightSemanticColors } from './semantic/colors'
import type { AppTheme } from './theme.types'

/**
 * Dark Theme stub — pre-configured for future dark mode support (Section 18 of ui-guide.md).
 * In Phase 3.5 we default to lightTheme, but the structure is 100% prepared.
 */
export const darkTheme: AppTheme = {
  isDark: true,
  palette,
  colors: {
    ...lightSemanticColors,
    background: palette.gray900,
    surface: palette.gray800,
    surfaceElevated: palette.gray800,
    foreground: palette.gray0,
    foregroundSecondary: palette.gray300,
    foregroundMuted: palette.gray500,
    foregroundInverse: palette.gray900,
    border: palette.gray700,
    borderStrong: palette.gray600,
    divider: palette.gray800,
  },
  spacing,
  typography,
  radius,
  shadows,
  motion,
}
