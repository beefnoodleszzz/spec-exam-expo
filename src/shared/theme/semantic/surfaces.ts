import { lightSemanticColors } from './colors'
import { radius } from '../primitives/radius'
import { shadows } from '../primitives/shadows'

export const surfaces = {
  card: {
    backgroundColor: lightSemanticColors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: lightSemanticColors.border,
  },
  cardElevated: {
    backgroundColor: lightSemanticColors.surfaceElevated,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  dialog: {
    backgroundColor: lightSemanticColors.surfaceElevated,
    borderRadius: radius.xl,
    ...shadows.lg,
  },
  bottomSheet: {
    backgroundColor: lightSemanticColors.surfaceElevated,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    ...shadows.lg,
  },
} as const
