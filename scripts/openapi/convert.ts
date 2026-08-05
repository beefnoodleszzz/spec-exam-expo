/**
 * Convert Swagger 2.0 → OpenAPI 3.x
 *
 * Usage: pnpm api:convert
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

async function convert() {
  const { default: converter } = await import('swagger2openapi')

  const inputPath = join(process.cwd(), 'openapi', 'source', 'swagger.json')
  const outputDir = join(process.cwd(), 'openapi', 'normalized')
  const outputPath = join(outputDir, 'openapi.json')

  const swagger = JSON.parse(readFileSync(inputPath, 'utf-8'))

  const options = {
    patch: true,
    warnOnly: true,
    resolveInternal: true,
  }

  const result = await new Promise<{ openapi: object }>((resolve, reject) => {
    converter.convertObj(swagger, options, (err: Error | null, res: { openapi: object }) => {
      if (err) reject(err)
      else resolve(res)
    })
  })

  mkdirSync(outputDir, { recursive: true })
  writeFileSync(outputPath, JSON.stringify(result.openapi, null, 2), 'utf-8')

  console.log(`✅ OpenAPI 3.x saved to ${outputPath}`)
}

convert().catch((err) => {
  console.error(err)
  process.exit(1)
})
