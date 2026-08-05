# OpenAPI Patches

This directory documents client-compatibility patches applied to the normalized OpenAPI spec.

## Why patches?

The backend API serves Swagger 2.0 with some non-standard patterns:
- Response types declared as `object` instead of specific schemas
- Missing `operationId` on some endpoints
- Business envelope (`{ status, data, total }`) not reflected in schema
- Some numeric values returned as strings
- `StatusCode` and `code` both present

Patches are applied by `scripts/openapi/patch.ts` after `api:convert`.

## Patch Format

Each patch in the script must include:
1. **Patch ID**: Sequential number (PATCH 001, PATCH 002, ...)
2. **Problem**: What's wrong with the current schema
3. **Fix**: What the patch changes
4. **Verified against**: Real response fixture path

## Current Patches

_None yet — will be populated during Phase 1 (Swagger pipeline)._

## Rules

- Patches must NOT change the actual API endpoint behavior
- Patches must be idempotent (safe to run multiple times)
- All patches must have fixture verification
- Backend changes are not required or expected
