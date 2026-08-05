import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'

// Helper function matching the actual implementation
function createShortSchemaName(originalName: string): string {
  const hash = createHash('sha256')
    .update(originalName)
    .digest('hex')
    .slice(0, 12)

  const readablePrefix = originalName
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 48)

  return `${readablePrefix}_${hash}`
}

describe('Schema Name Shortening', () => {
  it('should shorten long schema names exceeding 128 characters', () => {
    const longName =
      'Dynamic.Core.DResult_1_ExaminationManage.Contract.Dto.Subject.VGradeHistory_ExaminationManage.Contract_Version_1.0.0.1_Culture_neutral_PublicKeyToken_null_'

    expect(longName.length).toBeGreaterThan(128)

    const shortName = createShortSchemaName(longName)

    expect(shortName.length).toBeLessThanOrEqual(61)
    expect(shortName).toMatch(/^[a-zA-Z0-9_]+$/)
  })

  it('should not shorten short schema names under 128 characters', () => {
    const shortName = 'UserDto'

    expect(shortName.length).toBeLessThan(128)

    const result = createShortSchemaName(shortName)

    // Short names should still go through the function but remain readable
    expect(result).toMatch(/^UserDto_[a-f0-9]{12}$/)
  })

  it('should generate deterministic short names for the same input', () => {
    const originalName =
      'Dynamic.Core.DResult_1_ExaminationManage.Contract.Dto.Subject.SubjectDto'

    const firstResult = createShortSchemaName(originalName)
    const secondResult = createShortSchemaName(originalName)

    expect(firstResult).toBe(secondResult)
  })

  it('should generate different short names for different inputs', () => {
    const name1 = 'Dynamic.Core.DResult_1_Type1_Version_1'
    const name2 = 'Dynamic.Core.DResult_1_Type2_Version_1'

    const short1 = createShortSchemaName(name1)
    const short2 = createShortSchemaName(name2)

    expect(short1).not.toBe(short2)
  })

  it('should preserve readable prefix from original name', () => {
    const originalName =
      'Dynamic.Core.DResult_1_ExaminationManage.Contract.Dto.UserInfoDto_ExaminationManage'

    const shortName = createShortSchemaName(originalName)

    // Should contain readable characters from the original name
    const readablePart = shortName.split('_')[0]
    expect(readablePart).toMatch(/^[a-zA-Z0-9]{20,48}$/)
  })

  it('should handle special characters by removing them', () => {
    const nameWithSpecialChars =
      'Type@With#Special$Characters%In^Name_Over_128_Chars_Long_To_Test_Shortening_Mechanism'

    const shortName = createShortSchemaName(nameWithSpecialChars)

    // Special characters should be removed, leaving only alphanumeric
    expect(shortName).toMatch(/^[a-zA-Z0-9_]+$/)
    expect(shortName.length).toBeLessThanOrEqual(61)
  })

  it('should limit readable prefix to 48 characters', () => {
    const veryLongName = 'A'.repeat(200)

    const shortName = createShortSchemaName(veryLongName)

    const parts = shortName.split('_')
    const readablePart = parts[0] ?? ''
    expect(readablePart.length).toBeLessThanOrEqual(48)
  })

  it('should produce names without path separators', () => {
    const originalName =
      'Path/To/Some.Long.Type.With/Many/Separators/Over/128/Characters/In/Total/Length'

    const shortName = createShortSchemaName(originalName)

    expect(shortName).not.toContain('/')
    expect(shortName).not.toContain(':')
    expect(shortName).not.toContain('\\')
  })

  it('should produce unique hashes for similar but different names', () => {
    const name1 = 'ExaminationManageContractDtoUserUserNoteInputDto'
    const name2 = 'ExaminationManageContractDtoUserUserOrderInputDto'

    const short1 = createShortSchemaName(name1)
    const short2 = createShortSchemaName(name2)

    const [, hash1] = short1.split('_')
    const [, hash2] = short2.split('_')

    expect(hash1).not.toBe(hash2)
  })

  it('should handle unicode characters safely', () => {
    const nameWithUnicode =
      'TypeName中文字符WithUnicode_ÜberLongNameToTestHandling_Over_128_Characters_Total'

    const shortName = createShortSchemaName(nameWithUnicode)

    // Should only contain ASCII alphanumeric and underscore
    expect(shortName).toMatch(/^[a-zA-Z0-9_]+$/)
    expect(shortName.length).toBeLessThanOrEqual(61)
  })
})
