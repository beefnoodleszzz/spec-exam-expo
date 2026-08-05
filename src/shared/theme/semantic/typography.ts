import { typography } from '../primitives/typography'
import { lightSemanticColors } from './colors'

export const semanticTypography = {
  display: {
    ...typography.display,
    color: lightSemanticColors.foreground,
  },
  title: {
    ...typography.title,
    color: lightSemanticColors.foreground,
  },
  heading: {
    ...typography.heading,
    color: lightSemanticColors.foreground,
  },
  body: {
    ...typography.body,
    color: lightSemanticColors.foreground,
  },
  bodySecondary: {
    ...typography.bodySecondary,
    color: lightSemanticColors.foregroundSecondary,
  },
  caption: {
    ...typography.caption,
    color: lightSemanticColors.foregroundMuted,
  },
  label: {
    ...typography.label,
    color: lightSemanticColors.foreground,
  },
} as const
