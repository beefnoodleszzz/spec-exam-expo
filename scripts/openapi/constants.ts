import { join } from 'node:path'

export const SWAGGER_SOURCE_URL =
  'https://iservice.enchunsi.com/ecsmotojk/swagger/v1/swagger.json'

export const OPENAPI_ROOT = join(
  process.cwd(),
  'openapi',
)

export const OPENAPI_SOURCE_DIR = join(
  OPENAPI_ROOT,
  'source',
)

export const OPENAPI_NORMALIZED_DIR = join(
  OPENAPI_ROOT,
  'normalized',
)

export const OPENAPI_REPORTS_DIR = join(
  OPENAPI_ROOT,
  'reports',
)

export const SWAGGER_SOURCE_PATH = join(
  OPENAPI_SOURCE_DIR,
  'swagger.json',
)

export const OPENAPI_NORMALIZED_PATH = join(
  OPENAPI_NORMALIZED_DIR,
  'openapi.json',
)
