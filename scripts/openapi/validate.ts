import {
  OPENAPI_NORMALIZED_PATH,
} from './constants'
import {
  forEachOperation,
  getPathTemplateParameterNames,
} from './operations'
import {
  readJsonFile,
  asRecord,
} from './utils'
import type { JsonObject } from './types'

function getDeclaredPathParameterNames(
  pathItem: JsonObject,
  operation: JsonObject,
): Set<string> {
  const containers = [
    pathItem.parameters,
    operation.parameters,
  ]

  const names = new Set<string>()

  for (const container of containers) {
    if (!Array.isArray(container)) {
      continue
    }

    for (const parameterValue of container) {
      const parameter =
        asRecord(parameterValue)

      if (
        parameter.in === 'path' &&
        typeof parameter.name === 'string'
      ) {
        names.add(parameter.name)
      }
    }
  }

  return names
}

async function validate(): Promise<void> {
  const spec = readJsonFile(
    OPENAPI_NORMALIZED_PATH,
  )

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { default: SwaggerParser } =
    await import(
      '@apidevtools/swagger-parser'
    )

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    // @ts-expect-error - SwaggerParser types are incompatible
    await SwaggerParser.validate(spec)
  } catch (error) {
    console.error(
      'Validation failed:',
      error instanceof Error
        ? error.message
        : error,
    )
    process.exit(1)
  }

  // Custom validation rules
  const errors: string[] = []

  if (
    typeof spec.openapi !== 'string' ||
    !spec.openapi.startsWith('3.')
  ) {
    errors.push('Missing or invalid openapi version')
  }

  const components = asRecord(spec.components)
  const schemas = asRecord(components.schemas)

  if (Object.keys(schemas).length === 0) {
    errors.push('No schemas defined')
  }

  const operationIds = new Map<
    string,
    string
  >()

  forEachOperation(
    spec,
    ({
      path,
      method,
      pathItem,
      operation,
    }) => {
      const operationLocation =
        `${method.toUpperCase()} ${path}`

      if (
        typeof operation.operationId !==
        'string' ||
        operation.operationId.trim() === ''
      ) {
        errors.push(
          `Missing operationId: ${operationLocation}`,
        )
      } else {
        const previous =
          operationIds.get(
            operation.operationId,
          )

        if (previous) {
          errors.push(
            `Duplicate operationId '${operation.operationId}': ${previous} and ${operationLocation}`,
          )
        } else {
          operationIds.set(
            operation.operationId,
            operationLocation,
          )
        }
      }

      const expectedNames =
        getPathTemplateParameterNames(path)

      const declaredNames =
        getDeclaredPathParameterNames(
          pathItem,
          operation,
        )

      for (const name of expectedNames) {
        if (!declaredNames.has(name)) {
          errors.push(
            `Missing path parameter '${name}': ${operationLocation}`,
          )
        }
      }

      for (const name of declaredNames) {
        if (!expectedNames.includes(name)) {
          errors.push(
            `Declared path parameter '${name}' is absent from route template: ${operationLocation}`,
          )
        }
      }
    },
  )

  if (errors.length > 0) {
    console.error(
      'Validation errors:',
      errors.join('\n'),
    )
    process.exit(1)
  }

  console.log('API specification validated')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  validate().catch((error: unknown) => {
    console.error(
      error instanceof Error
        ? error.message
        : error,
    )

    process.exit(1)
  })
}
