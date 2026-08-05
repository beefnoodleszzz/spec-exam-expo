/**
 * Authentication fixture analyzer.
 *
 * Analyzes sanitized response fixtures to extract runtime contract.
 *
 * USAGE:
 *   pnpm auth:analyze-fixture docs/auth/evidence/v2-login-success.json
 *
 * OUTPUT:
 *   Field names, types, nullability, and nesting structure.
 *   Does NOT print sensitive values (they should be redacted).
 */

import path from 'node:path'
import fs from 'node:fs/promises'

function getType(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) {
    if (value.length === 0) return 'array<unknown>'
    const first = getType(value[0])
    const allSame = value.every((v) => getType(v) === first)
    return allSame ? `array<${first}>` : 'array<mixed>'
  }
  return typeof value
}

function analyzeObject(
  obj: unknown,
  indent = 0,
): string[] {
  const lines: string[] = []
  const prefix = ' '.repeat(indent)

  if (typeof obj !== 'object' || obj === null) {
    return [`${prefix}: ${getType(obj)}`]
  }

  if (Array.isArray(obj)) {
    lines.push(`${prefix}: array (${obj.length} items)`)
    if (obj.length > 0) {
      lines.push(
        `${prefix}  [0]: ${getType(obj[0])}`,
      )
    }
    return lines
  }

  for (const [key, value] of Object.entries(obj)) {
    const type = getType(value)
    const nullable =
      value === null
        ? ' (nullable)'
        : ''

    if (type === 'object') {
      lines.push(
        `${prefix}${key}: object${nullable}`,
      )
      const nested = analyzeObject(value, indent + 2)
      lines.push(...nested)
    } else if (type.startsWith('array')) {
      lines.push(
        `${prefix}${key}: ${type}${nullable}`,
      )
    } else {
      lines.push(
        `${prefix}${key}: ${type}${nullable}`,
      )
    }
  }

  return lines
}

async function main() {
  const filePath = process.argv[2]

  if (!filePath) {
    console.error('Error: fixture file path is required')
    console.error(
      'Usage: pnpm auth:analyze-fixture <path>',
    )
    process.exit(1)
  }

  const absolutePath = path.resolve(filePath)

  try {
    const content = await fs.readFile(
      absolutePath,
      'utf-8',
    )
    const fixture = JSON.parse(content)

    console.log(`Analyzing: ${filePath}`)
    console.log('')
    console.log('Response structure:')
    console.log('')

    const lines = analyzeObject(fixture)
    for (const line of lines) {
      console.log(line)
    }

    console.log('')
    console.log('Notes:')
    console.log(
      '- Redacted values appear as <REDACTED_*> and are hidden',
    )
    console.log(
      '- Null values indicate nullable fields',
    )
    console.log(
      '- Object nesting shows data structure',
    )
    console.log(
      '- Use this structure to define Domain types',
    )
  } catch (err) {
    const error = err as NodeJS.ErrnoException
    if (error.code === 'ENOENT') {
      console.error(`Error: File not found: ${filePath}`)
    } else {
      console.error(`Error: ${error.message}`)
    }
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err.message)
  process.exit(1)
})
