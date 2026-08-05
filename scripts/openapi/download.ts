import {
  mkdirSync,
  renameSync,
  writeFileSync,
} from 'node:fs'
import { dirname } from 'node:path'

import {
  SWAGGER_SOURCE_PATH,
  SWAGGER_SOURCE_URL,
} from './constants'
import { detectApiSpecVersion } from './utils'
import type { JsonObject } from './types'

const DOWNLOAD_TIMEOUT_MS = 30_000

async function download(): Promise<void> {
  const controller = new AbortController()

  const timer = setTimeout(() => {
    controller.abort()
  }, DOWNLOAD_TIMEOUT_MS)

  try {
    console.log(
      `Downloading API specification:\n${SWAGGER_SOURCE_URL}`,
    )

    const response = await fetch(
      SWAGGER_SOURCE_URL,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      },
    )

    if (!response.ok) {
      throw new Error(
        `Swagger download failed: ${response.status} ${response.statusText}`,
      )
    }

    const contentType =
      response.headers.get('content-type') ?? ''

    if (
      contentType.length > 0 &&
      !contentType.includes('json')
    ) {
      throw new Error(
        `Expected JSON response but received ${contentType}`,
      )
    }

    const text = await response.text()

    let document: unknown

    try {
      document = JSON.parse(text)
    } catch {
      throw new Error(
        'Swagger endpoint returned invalid JSON',
      )
    }

    if (
      typeof document !== 'object' ||
      document === null ||
      Array.isArray(document)
    ) {
      throw new Error(
        'Swagger endpoint did not return a JSON object',
      )
    }

    const spec = document as JsonObject
    const detected = detectApiSpecVersion(spec)

    mkdirSync(
      dirname(SWAGGER_SOURCE_PATH),
      { recursive: true },
    )

    const temporaryPath =
      `${SWAGGER_SOURCE_PATH}.tmp`

    writeFileSync(
      temporaryPath,
      `${JSON.stringify(spec, null, 2)}\n`,
      'utf8',
    )

    renameSync(
      temporaryPath,
      SWAGGER_SOURCE_PATH,
    )

    console.log(
      [
        'API specification downloaded successfully',
        `Format: ${detected.kind}`,
        `Version: ${detected.version}`,
        `Bytes: ${Buffer.byteLength(text, 'utf8')}`,
        `Saved: ${SWAGGER_SOURCE_PATH}`,
      ].join('\n'),
    )
  } finally {
    clearTimeout(timer)
  }
}

download().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? error.message
      : error,
  )

  process.exit(1)
})
