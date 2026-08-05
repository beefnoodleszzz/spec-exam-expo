import { palette } from './primitives/palette'
import { spacing } from './primitives/spacing'
import { typography } from './primitives/typography'
import { radius } from './primitives/radius'
import { shadows } from './primitives/shadows'
import { motion } from './primitives/motion'
import { lightSemanticColors } from './semantic/colors'
import type { AppTheme } from './theme.types'

export const lightTheme: AppTheme = {
  isDark: false,
  palette,
  colors: lightSemanticColors,
  spacing,
  typography,
  radius,
  shadows,
  motion,
}
