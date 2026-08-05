# OpenAPI & Orval Code Generation

## Overview

This project uses OpenAPI/Swagger specification as the source of truth for API contracts, with Orval generating TypeScript client code automatically from the specification.

## Architecture

### Source of Truth

- **Swagger Specification**: `openapi/source/` — The base API specification from the backend
- **Normalized OpenAPI**: `openapi/normalized/openapi.json` — Converted and normalized to OpenAPI 3.0 format
- **Generated Code**: `src/shared/api/generated/` — Auto-generated TypeScript client code

### Pipeline

```
Swagger Spec
    ↓
[Convert] → OpenAPI 3.0 (normalized)
    ↓
[Patch] → Apply transformations (operation IDs, path parameters, schema normalization)
    ↓
[Validate] → Verify specification integrity
    ↓
[Report] → Generate documentation and warnings
    ↓
[Generate] → Orval creates TypeScript client code
    ↓
Generated Endpoints & Models
```

## Important Rules

### Generated Code Management

**Generated code MUST be committed to git.**

- All files in `src/shared/api/generated/` are auto-generated and must be included in version control
- CI verifies reproducibility: running `pnpm api:check` ensures re-generation produces identical output
- This proves the build is deterministic and protects against accidental manual edits

### No Manual Editing

Generated files MUST NOT be edited manually:

- `src/shared/api/generated/endpoints/**/*.ts`
- `src/shared/api/generated/models/**/*.ts`

If generated types are incorrect, fix the OpenAPI specification or patches, then regenerate.

### CI Integration

The quality gate CI pipeline includes:

```yaml
- name: OpenAPI Determinism
  run: pnpm api:check
```

This step:
1. Converts source spec to OpenAPI 3.0
2. Applies patches (infer parameters, normalize names, etc.)
3. Validates the spec
4. Generates reports
5. Regenerates client code
6. Verifies no changes via `git diff --exit-code`

If this fails, the spec or generation pipeline has non-determinism and must be fixed before merge.

## Command Reference

### Development

```bash
# Download latest spec from backend
pnpm api:download

# Convert Swagger → OpenAPI 3.0
pnpm api:convert

# Apply transformations (PATCH-001 through PATCH-004)
pnpm api:patch

# Validate specification
pnpm api:validate

# Generate documentation reports
pnpm api:report

# Generate TypeScript client code
pnpm api:generate

# Full refresh (download + convert + patch + validate + report + generate)
pnpm api:refresh
```

### Quality Assurance

```bash
# Verify determinism — regenerate and check for diff
pnpm api:check
```

This is used in CI to prevent non-deterministic output.

## Patch Documentation

The following patches are applied to normalize and fix the Swagger specification:

| Patch ID | Purpose |
|----------|---------|
| PATCH-001 | Ensure deterministic `operationId` values for all operations |
| PATCH-002 | Infer missing path parameters from route templates |
| PATCH-003 | Normalize path parameter names to match route template case |
| PATCH-004 | Shorten excessively long schema names (>128 chars) to avoid FS path limits |

### Schema Name Shortening

Long schema names are shortened using a readable prefix + hash:

```
Original (180 chars):
Dynamic.Core.DResult_1_ExaminationManage.Contract.Dto.Subject.SubjectStatics_ExaminationManage.Contract_Version_1.0.0.1_Culture_neutral_PublicKeyToken_null_

Shortened:
DynamicCoreDResult1ExaminationManageContractDtoS_255becb34eda
```

Mapping is preserved in `openapi/reports/schema-name-mapping.md` for reference.

## Response Contract

### Mutator Design

The Orval mutator (`src/shared/api/client/orval-mutator.ts`) handles the HTTP transport layer:

- **Input**: Orval-generated function calls with HTTP config (URL, method, headers, body)
- **Output**: Response wrapper with `{ data, status, headers }`

This matches Orval's expected response type structure from the OpenAPI spec.

### Type Safety

- Generated functions return `Promise<ResponseWrapper>` where `ResponseWrapper = { data: T, status: number, headers: Headers }`
- Typecheck (`pnpm typecheck:app`) verifies all generated code is type-safe
- Mutator is tested (`src/shared/api/client/__tests__/orval-mutator.test.ts`) for signal forwarding, header handling, and response structure

## Reports

Generated after `pnpm api:report`:

- **endpoints.md** — All 128+ operations with method, path, operationId, response type
- **schemas.md** — All 151+ schemas with type and required fields
- **warnings.md** — 46+ warnings (mostly missing operation summaries)
- **schema-name-mapping.md** — Mapping of shortened → original schema names

## Troubleshooting

### Non-deterministic Generation

If `pnpm api:check` fails with diff output:

1. Inspect the changes: `git diff openapi/normalized src/shared/api/generated`
2. Check if the spec file itself changed unexpectedly
3. Verify patch logic doesn't produce variable output (e.g., random IDs)
4. Run `pnpm api:check` again — should be identical on second run

### Type Errors After Regeneration

If typecheck fails after regeneration:

1. Check that `orval.config.ts` is correct (paths, mutator reference)
2. Verify Orval version matches expectations
3. Inspect generated response types match mutator's return type
4. Run `pnpm api:generate` again to ensure clean generation

### Missing Path Parameters

If routes have `{id}` placeholders but operations don't declare them:

- PATCH-002 automatically infers and adds the parameters
- Check `openapi/reports/warnings.md` for `INFERRED_PATH_PARAMETER` entries
- These are marked with `x-client-inferred: true` in the spec

## Mutator Type Boundary

Orval passes the complete generated HTTP response type as the generic argument to the custom mutator.

The mutator runtime response is verified to have the following shape:

```ts
{
  data: RawSwaggerResponseBody
  status: number
  headers: Headers
}
```

A generic assertion remains at the Orval integration boundary because the generated response type includes operation-specific status literals and response schemas that cannot be reconstructed from the generic request configuration alone.

This assertion is permitted only at this boundary and is protected by:

- request metadata contract tests (`src/shared/api/client/__tests__/request-metadata.test.ts`)
- Orval mutator integration tests (`src/shared/api/client/__tests__/orval-envelope-contract.test.ts`)
- generated code type checking (`pnpm typecheck`)
- deterministic code generation (`pnpm api:check`)

**Important**: Do NOT replicate this assertion elsewhere in the application. All other layers must explicitly extract and validate data through proper types, not through cast-based assumptions.

## Further Reading

- [OpenAPI 3.0 Spec](https://spec.openapis.org/oas/v3.0.3)
- [Orval Documentation](https://orval.dev/)
- [Backend Swagger Endpoint](http://api-endpoint/swagger) (replace with actual backend URL)
