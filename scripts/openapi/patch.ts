/**
 * Apply client-compatibility patches to the normalized OpenAPI spec.
 *
 * Each patch must be:
 * 1. Traceable (documented below)
 * 2. Repeatable (idempotent)
 * 3. Explained in plain language
 * 4. Non-behavioral (must not change actual API behavior)
 * 5. Verified against real response fixtures
 *
 * Usage: pnpm api:patch
 */
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

type OpenAPIDoc = Record<string, unknown>

const inputPath = join(process.cwd(), 'openapi', 'normalized', 'openapi.json')
const outputPath = inputPath

const doc = JSON.parse(readFileSync(inputPath, 'utf-8')) as OpenAPIDoc

// -------------------------------------------------------------------------
// Patch list (add patches here as needed)
// -------------------------------------------------------------------------

/*
  PATCH 001: (Example template — uncomment and adapt)
  Problem: Endpoint X returns { status: boolean, data: T } but Swagger declares
           the response as just `object`, breaking type generation.
  Fix: Refine the response schema to reflect the envelope structure.

  const paths = doc.paths as Record<string, unknown>
  ...
*/

// -------------------------------------------------------------------------

writeFileSync(outputPath, JSON.stringify(doc, null, 2), 'utf-8')
console.log('✅ Patches applied')
