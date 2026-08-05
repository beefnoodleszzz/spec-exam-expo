# Authentication Contract Sanitization Tools

Three scripts work together to safely capture and prepare authentication API responses for git storage.

## Contract Redaction Library

**File:** `scripts/auth/contract-redaction.ts`

Exports: `sanitizeContract(value: unknown): unknown`

Replaces sensitive field values with placeholders:

```typescript
import { sanitizeContract } from '@/scripts/auth/contract-redaction'

const raw = {
  examToken: 'eyJhbGci...',
  userId: '12345',
  phone: '13812340000',
  examTypeId: 'exam-1', // preserved
}

const sanitized = sanitizeContract(raw)
// {
//   examToken: '<ACCESS_TOKEN>',
//   userId: '<USER_ID>',
//   phone: '1381234****',
//   examTypeId: 'exam-1',
// }
```

**Redaction Rules:**

- Exact field name matching (case-insensitive)
- `token`, `accessToken`, `examToken` → `<ACCESS_TOKEN>`
- `userId`, `uid`, `memberId` → `<USER_ID>`
- `phone`, `phoneNumber`, `mobile`, `mobilePhone` → last 4 digits replaced
- `deviceId`, `terminalId` → `<DEVICE_ID>`
- `inviteCode`, `iptInviteCode` → `<INVITE_CODE>`
- Generic `id` fields are preserved (examTypeId, provinceCode, clientType, etc.)
- Null values are preserved
- Nested objects and arrays are recursively processed

## Sanitization Script

**File:** `scripts/auth/sanitize-contract.ts`

```bash
pnpm auth:sanitize-contract <input-path> [output-path]
```

**Input:** Raw JSON response from `.tmp/auth-contract/raw/`

**Output:** Sanitized JSON to `.tmp/auth-contract/sanitized/`

**Example:**

```bash
pnpm auth:sanitize-contract .tmp/auth-contract/raw/v2-login-success.json
# → .tmp/auth-contract/sanitized/v2-login-success.json
```

**Manual Output Path:**

```bash
pnpm auth:sanitize-contract \
  .tmp/auth-contract/raw/login.json \
  .tmp/auth-contract/sanitized/login.json
```

## Validation Script

**File:** `scripts/auth/validate-sanitized-contract.ts`

```bash
pnpm auth:validate-contract <fixture-path>
```

Checks for accidentally unredacted sensitive data:

- **JWT Token Pattern:** `eyJ[A-Za-z0-9_-]+.[A-Za-z0-9_-]+.[A-Za-z0-9_-]+`
- **Complete Phone Number:** `1[3-9]xxxxxxxx` (11 consecutive digits)
- **Long Secret:** 32+ alphanumeric characters

**Exit Codes:**

- `0` — No sensitive values detected ✓
- `1` — Sensitive values found, fixture is unsafe

**Example:**

```bash
$ pnpm auth:validate-contract .tmp/auth-contract/sanitized/v2-login-success.json
Sanitized contract validation passed
```

```bash
$ pnpm auth:validate-contract .tmp/auth-contract/raw/v2-login-success.json
$.data.examToken: Possible JWT token
$.data.userId: Possible unredacted secret
Error: Fixture contains possible sensitive values
```

## Analysis Script

**File:** `scripts/auth/analyze-fixture.ts`

```bash
pnpm auth:analyze-fixture <fixture-path>
```

**Input:** Sanitized JSON fixture

**Output:** Runtime contract structure without sensitive values

**Example Output:**

```
$.status: boolean
$.code: union (string | number) nullable
$.data: object
$.data.examToken: string
$.data.userId: string
$.data.userInfo: object
$.data.userInfo.phone: string
$.data.userInfo.email: string
$.data.items: array length=2
$.data.items[0]: object
$.data.items[0].id: string
$.data.items[0].name: string
```

## Unit Tests

**File:** `scripts/auth/__tests__/sanitize-contract.test.ts`

16 test cases covering:

- Exact field name redaction
- Nested object redaction
- Array item redaction
- Null value preservation
- Generic id field preservation
- Case-insensitive field matching
- Input immutability

```bash
pnpm test:unit
```

## Workflow Summary

```
Raw Response (from Postman/Charles)
    ↓
.tmp/auth-contract/raw/login.json
    ↓
pnpm auth:sanitize-contract
    ↓
.tmp/auth-contract/sanitized/login.json
    ↓
pnpm auth:validate-contract (must pass)
    ↓
Human manual review
    ↓
copy to docs/auth/evidence/
    ↓
pnpm auth:analyze-fixture (extract schema)
    ↓
Define Domain types based on structure
```

## Security Notes

- **Never** commit files from `.tmp/auth-contract/raw/`
- **Always** run validation before copying to evidence directory
- **Manual review** is required even after validation
- Redaction patterns are conservative (JWT, phone, long secrets)
- Additional manual checks may be needed for context-specific secrets
- If in doubt, redact more aggressively

## Adding New Redaction Rules

Edit `scripts/auth/contract-redaction.ts`:

```typescript
const EXACT_REDACTIONS: Record<string, string> = {
  // Add new field → placeholder mapping
  secretField: '<PLACEHOLDER>',
}
```

Add corresponding test case in `scripts/auth/__tests__/sanitize-contract.test.ts`.

Run tests:

```bash
pnpm test:unit
```
