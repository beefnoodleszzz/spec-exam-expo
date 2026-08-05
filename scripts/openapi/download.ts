/**
 * Download Swagger JSON from the backend.
 * Saves to openapi/source/swagger.json without modification.
 *
 * Usage: pnpm api:download
 */
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { AppConfig } from '../../src/shared/config/app.config'

// Swagger endpoint — adjust if backend exposes a different path
const SWAGGER_URL = AppConfig.API_BASE_URL.replace('/api/', '/v2/api-docs')

async function download() {
  console.log(`Downloading Swagger from: ${SWAGGER_URL}`)

  const res = await fetch(SWAGGER_URL)
  if (!res.ok) {
    throw new Error(`Failed to fetch Swagger: ${res.status} ${res.statusText}`)
  }

  const json = await res.json()

  mkdirSync(join(process.cwd(), 'openapi', 'source'), { recursive: true })
  const outPath = join(process.cwd(), 'openapi', 'source', 'swagger.json')
  writeFileSync(outPath, JSON.stringify(json, null, 2), 'utf-8')

  console.log(`✅ Saved to ${outPath}`)
}

download().catch((err) => {
  console.error(err)
  process.exit(1)
})
