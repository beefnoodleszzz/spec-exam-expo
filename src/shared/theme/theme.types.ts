import type { palette } from './primitives/palette'
import type { spacing } from './primitives/spacing'
import type { typography } from './primitives/typography'
import type { radius } from './primitives/radius'
import type { shadows } from './primitives/shadows'
import type { motion } from './primitives/motion'
import type { SemanticColorKey } from './semantic/colors'

export interface AppTheme {
  isDark: boolean
  palette: typeof palette
  colors: Record<SemanticColorKey, string>
  spacing: typeof spacing
  typography: typeof typography
  radius: typeof radius
  shadows: typeof shadows
  motion: typeof motion
}
