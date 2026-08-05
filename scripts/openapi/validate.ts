import {
  OPENAPI_NORMALIZED_PATH,
} from './constants'
import {
  readJsonFile,
  asRecord,
} from './utils'
import type { JsonObject } from './types'

async function validate(): Promise<void> {
  const spec = readJsonFile(
    OPENAPI_NORMALIZED_PATH,
  )

  const { default: SwaggerParser } =
    await import(
      '@apidevtools/swagger-parser'
    )

  try {
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

  const paths =
    asRecord(spec.paths) ?? {}

  if (Object.keys(paths).length === 0) {
    errors.push('No paths defined')
  }

  const schemas =
    asRecord(spec.components?.schemas) ??
    {}

  if (Object.keys(schemas).length === 0) {
    errors.push('No schemas defined')
  }

  if (errors.length > 0) {
    console.error(
      'Validation errors:',
      errors.join('\n'),
    )
    process.exit(1)
  }

  console.log('API specification validated')
}

validate().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? error.message
      : error,
  )

  process.exit(1)
})
