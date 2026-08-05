import {
  OPENAPI_NORMALIZED_PATH,
} from './constants'
import {
  readJsonFile,
  writeJsonFile,
} from './utils'
import { patches } from './patches'

async function patch(): Promise<void> {
  const document =
    readJsonFile(OPENAPI_NORMALIZED_PATH)

  const applied: string[] = []

  for (const patchDefinition of patches) {
    if (patchDefinition.apply(document)) {
      applied.push(patchDefinition.id)
    }
  }

  writeJsonFile(
    OPENAPI_NORMALIZED_PATH,
    document,
  )

  console.log(
    [
      'API specification patched',
      `Applied: ${
        applied.join(', ') || 'none'
      }`,
    ].join('\n'),
  )
}

if (import.meta.url === `file://${process.argv[1]}`) {
  patch().catch((error: unknown) => {
    console.error(
      error instanceof Error
        ? error.message
        : error,
    )

    process.exit(1)
  })
}
