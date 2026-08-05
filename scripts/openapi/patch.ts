import {
  OPENAPI_NORMALIZED_PATH,
} from './constants'
import {
  readJsonFile,
  writeJsonFile,
  asRecord,
} from './utils'
import type { JsonObject } from './types'

interface OpenApiPatch {
  id: string
  description: string
  apply(document: JsonObject): boolean
}

function createOperationId(
  method: string,
  path: string,
): string {
  const parts = path
    .split('/')
    .filter(Boolean)
    .flatMap((part) =>
      part
        .replace(/[{}]/g, '')
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean),
    )

  const pascalPath = parts
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join('')

  return method.toLowerCase() + pascalPath
}

const patches: OpenApiPatch[] = [
  {
    id: 'ensure-operationid',
    description:
      'Ensure all operations have operationId',
    apply(doc: JsonObject): boolean {
      const paths =
        asRecord(doc.paths) ?? {}
      let changed = false

      const httpMethods = new Set([
        'get',
        'post',
        'put',
        'patch',
        'delete',
        'options',
        'head',
      ])

      for (const [path, pathItem] of Object.entries(
        paths,
      )) {
        const item = asRecord(pathItem)
        for (const [method, operation] of Object.entries(
          item,
        )) {
          if (!httpMethods.has(method)) continue

          const op = asRecord(operation)
          if (!op.operationId) {
            op.operationId =
              createOperationId(
                method,
                path,
              )
            changed = true
          }
        }
      }

      return changed
    },
  },
]

async function patch(): Promise<void> {
  const doc =
    readJsonFile(OPENAPI_NORMALIZED_PATH)

  const applied: string[] = []

  for (const p of patches) {
    if (p.apply(doc)) {
      applied.push(p.id)
    }
  }

  if (applied.length > 0) {
    writeJsonFile(
      OPENAPI_NORMALIZED_PATH,
      doc,
    )
  }

  console.log(
    [
      'API Specification Patched',
      `Applied: ${applied.join(', ') || 'none'}`,
    ].join('\n'),
  )
}

patch().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? error.message
      : error,
  )

  process.exit(1)
})
