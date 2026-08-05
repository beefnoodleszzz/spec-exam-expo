import {
  OPENAPI_NORMALIZED_PATH,
  OPENAPI_REPORTS_DIR,
} from './constants'
import {
  readJsonFile,
  writeFile,
} from './utils'
import type { JsonObject } from './types'
import { asRecord } from './utils'

async function generateSchemaNameMapping(): Promise<void> {
  const document = readJsonFile(OPENAPI_NORMALIZED_PATH)
  const mapping = asRecord(document['x-client-schema-name-mapping'] || {})

  if (Object.keys(mapping).length === 0) {
    console.log('No schema name mappings found')
    return
  }

  const mappingEntries = Object.entries(mapping).sort(
    ([a], [b]) => a.localeCompare(b),
  )

  const markdownLines = [
    '# Schema Name Mapping',
    '',
    'This file documents the mapping between shortened schema names and their original names.',
    'Long schema names (exceeding 128 characters) are shortened to avoid file system path length limitations.',
    '',
    '| Generated Name | Original Name | Reason |',
    '|---|---|---|',
  ]

  for (const [shortName, originalName] of mappingEntries) {
    const reason = 'Original name exceeds 128 characters'
    markdownLines.push(
      `| \`${shortName}\` | \`${originalName}\` | ${reason} |`,
    )
  }

  markdownLines.push('')

  const markdown = markdownLines.join('\n')

  const reportPath = `${OPENAPI_REPORTS_DIR}/schema-name-mapping.md`
  writeFile(reportPath, markdown)

  console.log(
    [
      'Schema name mapping report generated',
      `Total mappings: ${mappingEntries.length}`,
      `Report: ${reportPath}`,
    ].join('\n'),
  )
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateSchemaNameMapping().catch((error: unknown) => {
    console.error(
      error instanceof Error
        ? error.message
        : error,
    )

    process.exit(1)
  })
}
