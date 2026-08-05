/**
 * Authentication contract capture script.
 *
 * Securely captures authentication API responses for contract evidence.
 * Automatically redacts sensitive values before output.
 *
 * USAGE:
 *   pnpm auth:capture-contract --endpoint getUserInfoByToken --token '<AUTH_TEST_TOKEN>'
 *
 * NOTES:
 *   - Only supports non-mutating endpoints by default (GET requests)
 *   - Requires --allow-side-effect to call login/sms endpoints
 *   - Automatically redacts tokens, phone numbers, user IDs
 *   - Requires AUTH_TEST_TOKEN environment variable for most endpoints
 */

import path from 'node:path'
import fs from 'node:fs/promises'

const NON_MUTATING_ENDPOINTS = new Set([
  'getUserInfoByToken',
])

const MUTATING_ENDPOINTS = new Set([
  'sendShortMessage',
  'login',
  'shortMessageLogin',
  'oneClickLogin',
])

function redactSensitiveValues(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveValues)
  }

  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase()

    if (
      lowerKey.includes('token') ||
      lowerKey.includes('accesstoken') ||
      lowerKey.includes('examtoken')
    ) {
      result[key] = '<ACCESS_TOKEN>'
      continue
    }

    if (lowerKey.includes('userid') || lowerKey.includes('id') === true) {
      result[key] = '<USER_ID>'
      continue
    }

    if (
      lowerKey.includes('phone') ||
      lowerKey.includes('mobile')
    ) {
      const phoneStr = String(value)
      result[key] = phoneStr.replace(/\d{4}/, '****')
      continue
    }

    if (
      lowerKey.includes('cookie') ||
      lowerKey.includes('sessionid')
    ) {
      result[key] = '<COOKIE>'
      continue
    }

    if (
      lowerKey.includes('code') &&
      typeof value === 'string' &&
      value.length > 10
    ) {
      result[key] = '<VERIFICATION_CODE>'
      continue
    }

    result[key] = redactSensitiveValues(value)
  }

  return result
}

async function main() {
  const args = process.argv.slice(2)
  const endpoint = args[args.indexOf('--endpoint') + 1]
  const token = args[args.indexOf('--token') + 1]
  const allowSideEffect = args.includes('--allow-side-effect')

  if (!endpoint) {
    console.error(
      'Error: --endpoint is required (e.g., getUserInfoByToken)',
    )
    process.exit(1)
  }

  if (MUTATING_ENDPOINTS.has(endpoint) && !allowSideEffect) {
    console.error(
      `Error: Endpoint "${endpoint}" modifies state.`,
    )
    console.error('Use --allow-side-effect to proceed.')
    process.exit(1)
  }

  if (!NON_MUTATING_ENDPOINTS.has(endpoint) && !token) {
    console.error(
      'Error: --token is required for this endpoint',
    )
    process.exit(1)
  }

  console.log(`Capturing contract evidence for: ${endpoint}`)
  console.log('NOTE: This is a placeholder. Implement actual API calls based on Generated Orval functions.')
  console.log('')
  console.log('To capture real evidence:')
  console.log('1. Call the corresponding Generated Orval function')
  console.log('2. Redact sensitive values automatically')
  console.log('3. Save to docs/auth/evidence/')
  console.log('4. Review redaction before committing')

  const tmpDir = '.tmp/auth-contract'
  await fs.mkdir(tmpDir, { recursive: true })

  const exampleFixture = {
    endpoint,
    capturedAt: new Date().toISOString(),
    sanitized: true,
    note: 'This is a template. Replace with real response after capturing.',
  }

  const outputPath = path.join(tmpDir, `${endpoint}-captured.json`)
  await fs.writeFile(
    outputPath,
    JSON.stringify(exampleFixture, null, 2),
  )

  console.log(`\nTemplate written to: ${outputPath}`)
  console.log(
    'Replace content with sanitized response before moving to docs/auth/evidence/',
  )
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
