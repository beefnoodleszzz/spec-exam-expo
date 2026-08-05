/**
 * Sanitize authentication contract responses.
 *
 * Removes sensitive values from raw API responses before committing to git.
 *
 * USAGE:
 *   pnpm auth:sanitize-contract .tmp/auth-contract/raw/login.json
 *   pnpm auth:sanitize-contract \
 *     .tmp/auth-contract/raw/login.json \
 *     .tmp/auth-contract/sanitized/login.json
 */

import {
  mkdir,
  readFile,
  writeFile,
} from 'node:fs/promises'
import {
  basename,
  dirname,
  resolve,
} from 'node:path'
import {
  sanitizeContract,
} from './contract-redaction'

function assertJsonObject(
  value: unknown,
): asserts value is
  Record<string, unknown> {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    throw new Error(
      'Contract response must be a JSON object',
    )
  }
}

async function main(): Promise<void> {
  const inputArgument =
    process.argv[2]

  const outputArgument =
    process.argv[3]

  if (!inputArgument) {
    throw new Error(
      [
        'Input file is required.',
        'Usage:',
        '  pnpm auth:sanitize-contract .tmp/auth-contract/raw/login.json',
        '  pnpm auth:sanitize-contract .tmp/auth-contract/raw/login.json .tmp/auth-contract/sanitized/login.json',
      ].join('\n'),
    )
  }

  const inputPath =
    resolve(inputArgument)

  const outputPath = resolve(
    outputArgument ??
      `.tmp/auth-contract/sanitized/${
        basename(inputPath)
      }`,
  )

  const rawText =
    await readFile(
      inputPath,
      'utf8',
    )

  const parsed: unknown =
    JSON.parse(rawText)

  assertJsonObject(parsed)

  const sanitized =
    sanitizeContract(parsed)

  await mkdir(
    dirname(outputPath),
    {
      recursive: true,
    },
  )

  await writeFile(
    outputPath,
    `${JSON.stringify(
      sanitized,
      null,
      2,
    )}\n`,
    'utf8',
  )

  console.log(
    `Sanitized contract written: ${outputPath}`,
  )

  console.log(
    'Review the file manually before copying it into docs/auth/evidence/',
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
