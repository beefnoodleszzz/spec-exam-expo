import {
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { dirname } from 'node:path'

import type {
  ApiSpecVersion,
  JsonObject,
} from './types'

export function readJsonFile(
  filePath: string,
): JsonObject {
  const content = readFileSync(filePath, 'utf8')
  const value: unknown = JSON.parse(content)

  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    throw new Error(
      `Expected a JSON object in ${filePath}`,
    )
  }

  return value as JsonObject
}

export function writeJsonFile(
  filePath: string,
  value: unknown,
): void {
  mkdirSync(dirname(filePath), {
    recursive: true,
  })

  writeFileSync(
    filePath,
    `${JSON.stringify(value, null, 2)}\n`,
    'utf8',
  )
}

export function detectApiSpecVersion(
  document: JsonObject,
): ApiSpecVersion {
  // Standard Swagger 2.0
  if (document.swagger === '2.0') {
    return {
      kind: 'swagger-2',
      version: '2.0',
    }
  }

  // Non-standard but common: "chm" field
  if (document.chm === '2.0') {
    return {
      kind: 'swagger-2',
      version: '2.0',
    }
  }

  // OpenAPI 3.x
  if (
    typeof document.openapi === 'string' &&
    document.openapi.startsWith('3.')
  ) {
    return {
      kind: 'openapi-3',
      version: document.openapi,
    }
  }

  throw new Error(
    'Unsupported API document: expected Swagger 2.0 or OpenAPI 3.x',
  )
}

export function asRecord(
  value: unknown,
): JsonObject {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    return {}
  }

  return value as JsonObject
}

export function writeTextFile(
  filePath: string,
  content: string,
): void {
  mkdirSync(dirname(filePath), {
    recursive: true,
  })

  const normalized =
    content.endsWith('\n')
      ? content
      : `${content}\n`

  writeFileSync(
    filePath,
    normalized,
    'utf8',
  )
}
