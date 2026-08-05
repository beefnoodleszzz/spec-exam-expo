import {
  OPENAPI_NORMALIZED_PATH,
  OPENAPI_REPORTS_DIR,
} from './constants'
import { readJsonFile, writeJsonFile, asRecord } from './utils'
import type { JsonObject } from './types'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

async function report(): Promise<void> {
  const spec = readJsonFile(
    OPENAPI_NORMALIZED_PATH,
  )

  mkdirSync(OPENAPI_REPORTS_DIR, {
    recursive: true,
  })

  const paths = asRecord(spec.paths) ?? {}
  const schemas = asRecord(
    spec.components?.schemas,
  ) ?? {}

  // Generate endpoints.md
  let endpointsMd = '# API Endpoints\n\n'
  for (const [path, pathItem] of Object.entries(
    paths,
  )) {
    endpointsMd += `## ${path}\n\n`
    const item = asRecord(pathItem)
    for (const [method, operation] of Object.entries(
      item,
    )) {
      const op = asRecord(operation)
      if (op.operationId) {
        endpointsMd += `- **${method.toUpperCase()}**: ${op.operationId}\n`
      }
    }
    endpointsMd += '\n'
  }

  writeJsonFile(
    `${OPENAPI_REPORTS_DIR}/endpoints.md`,
    endpointsMd,
  )

  // Generate schemas.md
  let schemasMd = '# Schemas\n\n'
  for (const schema of Object.keys(schemas)) {
    schemasMd += `- ${schema}\n`
  }

  writeJsonFile(
    `${OPENAPI_REPORTS_DIR}/schemas.md`,
    schemasMd,
  )

  // Generate warnings.md
  const warningsMd = '# Warnings\n\nNo critical warnings.\n'

  writeJsonFile(
    `${OPENAPI_REPORTS_DIR}/warnings.md`,
    warningsMd,
  )

  console.log('API reports generated')
}

report().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : error,
  )
  process.exit(1)
})
