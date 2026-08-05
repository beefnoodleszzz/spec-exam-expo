# Authentication Contract Evidence

This directory records sanitized authentication API evidence.

## Redaction Rules

Raw credentials, phone numbers, access tokens, refresh tokens, cookies, device identifiers and personally identifiable information must never be committed.

Each fixture must record:

- endpoint
- HTTP method
- capture date
- environment
- HTTP status
- response headers relevant to the contract
- sanitized response body
- redaction notes

## Evidence Files

Expected fixtures (sanitized):

- `v2-login-success.json` — POST /api/examV2/app/login success response
- `v2-short-message-login-success.json` — POST /api/examV2/app/login/shortMessage success response
- `send-short-message-success.json` — GET /api/examV2/app/login/sendShortMessage success response
- `get-user-info-success.json` — GET /api/examV2/app/login/getUserInfoByToken success response
- `v2-oneclick-login-success.json` — POST /api/examV2/app/login/oneClickLogin success response
- `business-error.json` — Business error response (e.g., invalid code)
- `unauthorized-error.json` — Envelope 401 response

## Capturing Evidence

Evidence collection is performed manually by developers in controlled environments.

Raw responses should never be stored in git. Use this workflow:

### 1. Capture Raw Response

Use Postman, Charles Proxy, Proxyman, or device debugging to capture the raw API response.

Save to: `.tmp/auth-contract/raw/v2-login-success.json`

### 2. Sanitize

```bash
pnpm auth:sanitize-contract .tmp/auth-contract/raw/v2-login-success.json
```

Output: `.tmp/auth-contract/sanitized/v2-login-success.json`

### 3. Validate

Verify that no sensitive data remains:

```bash
pnpm auth:validate-contract .tmp/auth-contract/sanitized/v2-login-success.json
```

### 4. Review

Manually inspect the sanitized fixture before committing.

### 5. Copy to Evidence

```bash
cp .tmp/auth-contract/sanitized/v2-login-success.json docs/auth/evidence/
```

Do NOT commit any fixtures from `.tmp/` directory directly.

## Analysis

After fixtures are collected, analyze structure:

```bash
pnpm auth:analyze-fixture docs/auth/evidence/v2-login-success.json
```

Output identifies:
- response envelope structure
- data field type (object/array/primitive)
- top-level keys in data
- runtime types (string, number, boolean, object, array, null)
- nullable fields
- nested structures

This analysis drives type definition in Domain contracts.

## Do NOT Guess

- Token field name (could be `token`, `accessToken`, `examToken`, `authToken`, etc.)
- User ID field name (could be `userId`, `id`, `uid`, `examerId`, etc.)
- User info fields (only observable from fixture)
- Verification code field name (could be `code`, `verificationCode`, `smsCode`, etc.)
- Mobile field name (could be `mobile`, `phone`, `phoneNumber`, etc.)

Every field must be confirmed from sanitized response fixture.
