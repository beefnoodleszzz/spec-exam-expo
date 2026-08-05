import {
  OPENAPI_REPORTS_DIR,
  SWAGGER_SOURCE_PATH,
} from './constants'
import {
  detectApiSpecVersion,
  readJsonFile,
  writeJsonFile,
  asRecord,
} from './utils'
import type {
  ApiInspectionSummary,
  JsonObject,
} from './types'

async function inspect(): Promise<void> {
  const source = readJsonFile(SWAGGER_SOURCE_PATH)
  const detected = detectApiSpecVersion(source)

  const info = asRecord(source.info)
  const paths = asRecord(source.paths) ?? {}
  const definitions =
    asRecord(
      source.definitions ?? {},
    ) ?? {}
  const components = asRecord(source.components)
  const schemas =
    asRecord(components.schemas) ??
    asRecord(source.definitions) ??
    {}
  const tags = Array.isArray(source.tags)
    ? source.tags
    : []

  const host =
    typeof source.host === 'string'
      ? source.host
      : null
  const basePath =
    typeof source.basePath === 'string'
      ? source.basePath
      : null
  const servers: string[] = Array.isArray(
    source.servers,
  )
    ? (source.servers as JsonObject[])
        .map((s) => {
          const url = s.url
          return typeof url === 'string'
            ? url
            : 'unknown'
        })
    : []

  const httpMethods = new Set([
    'get',
    'post',
    'put',
    'patch',
    'delete',
    'options',
    'head',
  ])

  const methods: Record<string, number> = {}
  let operationCount = 0
  const missingOperationIds: string[] = []
  const duplicateOperationIds = new Map<
    string,
    number
  >()

  let deprecatedCount = 0

  for (const [path, pathItem] of Object.entries(
    paths,
  )) {
    const item = asRecord(pathItem)
    for (const [method, operation] of Object.entries(
      item,
    )) {
      if (!httpMethods.has(method)) continue

      const op = asRecord(operation)
      operationCount++

      methods[method] =
        (methods[method] ?? 0) + 1

      const operationId =
        typeof op.operationId === 'string'
          ? op.operationId
          : `${method}${path}`.replace(
              /[{}\/]/g,
              '',
            )

      if (typeof op.operationId !== 'string') {
        missingOperationIds.push(operationId)
      }

      duplicateOperationIds.set(
        operationId as string,
        (duplicateOperationIds.get(
          operationId as string,
        ) ?? 0) + 1,
      )

      if (op.deprecated === true) {
        deprecatedCount++
      }
    }
  }

  const duplicates = Array.from(
    duplicateOperationIds.entries(),
  )
    .filter(([, count]) => count > 1)
    .map(([id]) => id)

  const summary: ApiInspectionSummary = {
    sourceUrl:
      'https://iservice.enchunsi.com/ecsmotojk/swagger/v1/swagger.json',
    detectedVersion: detected,
    title:
      typeof info.title === 'string'
        ? info.title
        : null,
    apiVersion:
      typeof info.version === 'string'
        ? info.version
        : null,
    basePath,
    serverUrls: servers,
    pathCount: Object.keys(paths).length,
    operationCount,
    schemaCount: Object.keys(schemas).length,
    tagCount: tags.length,
    deprecatedOperationCount: deprecatedCount,
    missingOperationIdCount:
      missingOperationIds.length,
    duplicateOperationIds: duplicates,
    methods,
  }

  writeJsonFile(
    `${OPENAPI_REPORTS_DIR}/summary.json`,
    summary,
  )

  console.log(
    [
      'API Inspection Summary',
      `Title: ${summary.title}`,
      `Version: ${summary.apiVersion}`,
      `Paths: ${summary.pathCount}`,
      `Operations: ${summary.operationCount}`,
      `Schemas: ${summary.schemaCount}`,
      `Tags: ${summary.tagCount}`,
      `Missing operationId: ${summary.missingOperationIdCount}`,
      `Duplicate operationId: ${summary.duplicateOperationIds.length}`,
      `Deprecated: ${summary.deprecatedOperationCount}`,
    ].join('\n'),
  )

  if (duplicates.length > 0) {
    console.error(
      'ERROR: Duplicate operationIds detected:',
      duplicates.join(', '),
    )
    process.exit(1)
  }
}

inspect().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? error.message
      : error,
  )

  process.exit(1)
})
