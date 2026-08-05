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

import {
  readFile,
} from 'node:fs/promises'
import {
  resolve,
} from 'node:path'

function typeOfValue(
  value: unknown,
): string {
  if (value === null) {
    return 'null'
  }

  if (Array.isArray(value)) {
    return 'array'
  }

  return typeof value
}

function analyze(
  value: unknown,
  path: string,
  lines: string[],
): void {
  if (Array.isArray(value)) {
    lines.push(
      `${path}: array length=${value.length}`,
    )

    if (value.length > 0) {
      analyze(
        value[0],
        `${path}[0]`,
        lines,
      )
    }

    return
  }

  if (
    typeof value === 'object' &&
    value !== null
  ) {
    lines.push(
      `${path}: object`,
    )

    const entries =
      Object.entries(value)

    if (entries.length === 0) {
      lines.push(
        `${path}: empty-object`,
      )

      return
    }

    for (
      const [key, child]
      of entries
    ) {
      analyze(
        child,
        `${path}.${key}`,
        lines,
      )
    }

    return
  }

  lines.push(
    `${path}: ${typeOfValue(
      value,
    )}${
      value === null
        ? ' nullable'
        : ''
    }`,
  )
}

async function main(): Promise<void> {
  const argument =
    process.argv[2]

  if (!argument) {
    throw new Error(
      'Usage: pnpm auth:analyze-fixture <file>',
    )
  }

  const filePath =
    resolve(argument)

  const content =
    await readFile(
      filePath,
      'utf8',
    )

  const parsed: unknown =
    JSON.parse(content)

  const lines: string[] = []

  analyze(
    parsed,
    '$',
    lines,
  )

  console.log(
    lines.join('\n'),
  )
}

main().catch(
  (error: unknown) => {
    console.error(
      error instanceof Error
        ? error.message
        : String(error),
    )

    process.exit(1)
  },
)
