import { describe, it, expect } from 'vitest'
import { lightSemanticColors } from '@/shared/theme/semantic/colors'
import { buttonTokens } from '@/shared/theme/components/button.tokens'
import { spacing } from '@/shared/theme/primitives/spacing'

describe('Theme & Tokens', () => {
  it('has semantic primary color defined', () => {
    expect(lightSemanticColors.primary).toBe('#1677FF')
  })

  it('has button token minTouchArea defined as 44px', () => {
    expect(buttonTokens.minTouchArea).toBe(44)
  })

  it('has spacing scale with 4-point grid', () => {
    expect(spacing[1]).toBe(4)
    expect(spacing[4]).toBe(16)
  })
})
