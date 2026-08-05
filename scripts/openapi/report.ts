import { mkdirSync } from 'node:fs'

import {
  OPENAPI_NORMALIZED_PATH,
  OPENAPI_REPORTS_DIR,
} from './constants'
import {
  forEachOperation,
  getPathTemplateParameterNames,
} from './operations'
import {
  asRecord,
  readJsonFile,
  writeTextFile,
} from './utils'
import type { JsonObject } from './types'

interface WarningEntry {
  code: string
  location: string
  message: string
}

function getResponseSchemaName(
  operation: Record<string, unknown>,
): string {
  const responses =
    asRecord(operation.responses)

  const successfulResponse =
    responses['200'] ??
    responses['201'] ??
    responses.default

  const response =
    asRecord(successfulResponse)

  const content = asRecord(response.content)

  const jsonContent =
    asRecord(
      content['application/json'],
    )

  const schema = asRecord(jsonContent.schema)

  if (typeof schema.$ref === 'string') {
    const parts = schema.$ref.split('/')
    return parts[parts.length - 1] ?? 'Unknown'
  }

  if (
    typeof schema.type === 'string'
  ) {
    return schema.type
  }

  return 'Unspecified'
}

async function report(): Promise<void> {
  const spec =
    readJsonFile(OPENAPI_NORMALIZED_PATH)

  mkdirSync(OPENAPI_REPORTS_DIR, {
    recursive: true,
  })

  const endpointRows: string[] = [
    '# API Endpoints',
    '',
    '| Method | Path | Operation ID | Response |',
    '|---|---|---|---|',
  ]

  const warnings: WarningEntry[] = []

  forEachOperation(
    spec,
    ({
      path,
      method,
      operation,
    }) => {
      const operationId =
        typeof operation.operationId ===
        'string'
          ? operation.operationId
          : 'MISSING'

      endpointRows.push(
        `| ${method.toUpperCase()} | \`${path}\` | \`${operationId}\` | \`${getResponseSchemaName(operation)}\` |`,
      )

      if (!operation.summary) {
        warnings.push({
          code: 'MISSING_SUMMARY',
          location:
            `${method.toUpperCase()} ${path}`,
          message:
            'Operation has no summary.',
        })
      }

      const templateNames =
        getPathTemplateParameterNames(path)

      const parameters =
        Array.isArray(operation.parameters)
          ? operation.parameters
          : []

      for (const parameterValue of parameters) {
        const parameter =
          asRecord(parameterValue)

        if (
          parameter[
            'x-client-inferred'
          ] === true
        ) {
          warnings.push({
            code:
              'INFERRED_PATH_PARAMETER',
            location:
              `${method.toUpperCase()} ${path}`,
            message:
              `Path parameter '${String(
                parameter.name,
              )}' was inferred from the route template.`,
          })
        }
      }

      if (
        templateNames.length > 0 &&
        parameters.length === 0
      ) {
        warnings.push({
          code:
            'MISSING_PATH_PARAMETERS',
          location:
            `${method.toUpperCase()} ${path}`,
          message:
            'Route contains path placeholders but operation has no parameter declarations.',
        })
      }
    },
  )

  const components = asRecord(spec.components)
  const schemas =
    asRecord(components.schemas)

  const schemaRows: string[] = [
    '# Schemas',
    '',
    '| Schema | Type | Required fields |',
    '|---|---|---|',
  ]

  for (const [
    schemaName,
    schemaValue,
  ] of Object.entries(schemas).sort(
    ([left], [right]) =>
      left.localeCompare(right),
  )) {
    const schema = asRecord(schemaValue)

    const type =
      typeof schema.type === 'string'
        ? schema.type
        : 'object'

    const required =
      Array.isArray(schema.required)
        ? schema.required.join(', ')
        : ''

    schemaRows.push(
      `| \`${schemaName}\` | ${type} | ${required || '—'} |`,
    )
  }

  const warningRows: string[] = [
    '# OpenAPI Warnings',
    '',
  ]

  if (warnings.length === 0) {
    warningRows.push(
      'No warnings detected.',
    )
  } else {
    warningRows.push(
      '| Code | Location | Message |',
      '|---|---|---|',
    )

    for (const warning of warnings) {
      warningRows.push(
        `| ${warning.code} | \`${warning.location}\` | ${warning.message} |`,
      )
    }
  }

  writeTextFile(
    `${OPENAPI_REPORTS_DIR}/endpoints.md`,
    endpointRows.join('\n'),
  )

  writeTextFile(
    `${OPENAPI_REPORTS_DIR}/schemas.md`,
    schemaRows.join('\n'),
  )

  writeTextFile(
    `${OPENAPI_REPORTS_DIR}/warnings.md`,
    warningRows.join('\n'),
  )

  console.log(
    [
      'API reports generated',
      `Endpoints: ${
        endpointRows.length - 4
      }`,
      `Schemas: ${
        schemaRows.length - 4
      }`,
      `Warnings: ${warnings.length}`,
    ].join('\n'),
  )
}

if (import.meta.url === `file://${process.argv[1]}`) {
  report().catch((error: unknown) => {
    console.error(
      error instanceof Error
        ? error.message
        : error,
    )

    process.exit(1)
  })
}
