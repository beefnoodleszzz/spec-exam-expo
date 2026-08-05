/**
 * Validate that sanitized auth contracts contain no sensitive data.
 *
 * Checks for:
 * - JWT tokens (eyJ... pattern)
 * - Complete phone numbers (1[3-9]xxxxxxxx)
 * - Long secrets (32+ alphanumeric)
 *
 * USAGE:
 *   pnpm auth:validate-contract .tmp/auth-contract/sanitized/login.json
 */

import {
  readFile,
} from 'node:fs/promises'
import {
  resolve,
} from 'node:path'

interface Finding {
  path: string
  reason: string
}

const JWT_PATTERN =
  /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/

const PHONE_PATTERN =
  /(?<!\d)1[3-9]\d{9}(?!\d)/

const LONG_SECRET_PATTERN =
  /^[A-Za-z0-9+/_=-]{32,}$/

const ALLOWED_REDACTED_VALUES =
  new Set([
    '<ACCESS_TOKEN>',
    '<REFRESH_TOKEN>',
    '<USER_ID>',
    '<DEVICE_ID>',
    '<COOKIE>',
    '<IP_ADDRESS>',
    '<INVITE_CODE>',
    '138****0000',
  ])

function inspect(
  value: unknown,
  path: string,
  findings: Finding[],
): void {
  if (Array.isArray(value)) {
    value.forEach(
      (item, index) => {
        inspect(
          item,
          `${path}[${index}]`,
          findings,
        )
      },
    )

    return
  }

  if (
    typeof value === 'object' &&
    value !== null
  ) {
    for (
      const [key, child]
      of Object.entries(value)
    ) {
      inspect(
        child,
        path
          ? `${path}.${key}`
          : key,
        findings,
      )
    }

    return
  }

  if (typeof value !== 'string') {
    return
  }

  if (
    ALLOWED_REDACTED_VALUES.has(
      value,
    )
  ) {
    return
  }

  if (JWT_PATTERN.test(value)) {
    findings.push({
      path,
      reason:
        'Possible JWT token',
    })
  }

  if (PHONE_PATTERN.test(value)) {
    findings.push({
      path,
      reason:
        'Possible complete phone number',
    })
  }

  if (
    LONG_SECRET_PATTERN.test(value)
  ) {
    findings.push({
      path,
      reason:
        'Possible unredacted secret',
    })
  }
}

async function main(): Promise<void> {
  const argument =
    process.argv[2]

  if (!argument) {
    throw new Error(
      'Fixture path is required',
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

  const findings: Finding[] = []

  inspect(
    parsed,
    '$',
    findings,
  )

  if (findings.length > 0) {
    for (const finding of findings) {
      console.error(
        `${finding.path}: ${finding.reason}`,
      )
    }

    throw new Error(
      'Fixture contains possible sensitive values',
    )
  }

  console.log(
    'Sanitized contract validation passed',
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
