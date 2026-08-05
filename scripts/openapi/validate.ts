/**
 * Validate the normalized OpenAPI spec.
 *
 * Usage: pnpm api:validate
 */
import { readFileSync } from 'fs'
import { join } from 'path'

async function validate() {
  const { default: SwaggerParser } = await import('@apidevtools/swagger-parser')

  const specPath = join(process.cwd(), 'openapi', 'normalized', 'openapi.json')
  const spec = JSON.parse(readFileSync(specPath, 'utf-8'))

  try {
    await SwaggerParser.validate(spec)
    console.log('✅ OpenAPI spec is valid')
  } catch (err) {
    console.error('❌ OpenAPI validation failed:', err)
    process.exit(1)
  }
}

validate().catch((err) => {
  console.error(err)
  process.exit(1)
})
