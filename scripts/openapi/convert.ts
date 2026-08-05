import {
  OPENAPI_NORMALIZED_PATH,
  SWAGGER_SOURCE_PATH,
} from './constants'
import {
  detectApiSpecVersion,
  readJsonFile,
  writeJsonFile,
} from './utils'
import type { JsonObject } from './types'

interface SwaggerConversionResult {
  openapi: JsonObject
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function convertSwagger2(
  source: JsonObject,
): Promise<JsonObject> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const imported = await import(
    'swagger2openapi'
  )

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const converter = imported.default

  return new Promise<JsonObject>(
    (resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      converter.convertObj(
        source,
        {
          patch: true,
          warnOnly: false,
          resolveInternal: true,
        },
        (
          error: Error | null,
          result: SwaggerConversionResult,
        ) => {
          if (error) {
            reject(error)
            return
          }

          resolve(result.openapi)
        },
      )
    },
  )
}

async function convert(): Promise<void> {
  const source =
    readJsonFile(SWAGGER_SOURCE_PATH)

  const detected =
    detectApiSpecVersion(source)

  // Normalize non-standard "chm" to "swagger"
  if (
    detected.kind === 'swagger-2' &&
    !source.swagger &&
    source.chm === '2.0'
  ) {
    source.swagger = '2.0'
    delete source.chm
  }

  const normalized =
    detected.kind === 'swagger-2'
      ? await convertSwagger2(source)
      : structuredClone(source)

  writeJsonFile(
    OPENAPI_NORMALIZED_PATH,
    normalized,
  )

  console.log(
    [
      'API specification normalized',
      `Source: ${detected.kind}`,
      `Output: ${OPENAPI_NORMALIZED_PATH}`,
    ].join('\n'),
  )
}

convert().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? error.message
      : error,
  )

  process.exit(1)
})
