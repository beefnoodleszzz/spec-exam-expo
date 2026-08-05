# Authentication Response Redaction Rules

All sensitive data must be redacted before committing fixtures to git.

## Redaction Map

| Data | Replace With | Example |
|---|---|---|
| Phone number | `138****0000` | 13812340000 → 138****0000 |
| Access token | `<ACCESS_TOKEN>` | eyJhbGci... → `<ACCESS_TOKEN>` |
| Refresh token | `<REFRESH_TOKEN>` | refresh_xxx → `<REFRESH_TOKEN>` |
| User ID | `<USER_ID>` | 12345 or user-uuid → `<USER_ID>` |
| Device ID | `<DEVICE_ID>` | device-abc123 → `<DEVICE_ID>` |
| IP address | `<IP_ADDRESS>` | 192.168.1.1 → `<IP_ADDRESS>` |
| Cookie | `<COOKIE>` | session=xxx → `<COOKIE>` |
| Invite code | `<INVITE_CODE>` | ABC123XYZ → `<INVITE_CODE>` |

## Preserve

Do NOT redact:

- field names
- object nesting structure
- nullability (null vs. actual value)
- primitive types (string, number, boolean, etc.)
- array shapes (array of objects, array of strings, etc.)
- HTTP status codes
- error codes (200, 4001, etc.)
- HTTP headers relevant to auth contract (Content-Type, etc.)

## Do NOT Commit

Never commit unredacted:

- live access tokens
- valid verification codes
- valid phone numbers
- private user data (email, real name, etc.)
- cookies or session IDs
- device identifiers
- API keys or secrets

## Redaction Process

1. Capture raw response
2. Identify all sensitive fields manually
3. Apply redaction replacements
4. Review redacted fixture for safety
5. Commit to git

Example:

**Before redaction:**
```json
{
  "status": true,
  "data": {
    "examToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "612345",
    "userInfo": {
      "phone": "13812340000",
      "id": "612345"
    }
  }
}
```

**After redaction:**
```json
{
  "status": true,
  "data": {
    "examToken": "<ACCESS_TOKEN>",
    "userId": "<USER_ID>",
    "userInfo": {
      "phone": "138****0000",
      "id": "<USER_ID>"
    }
  }
}
```

## Verification

After redaction, ask:

- [ ] Are all phone numbers replaced?
- [ ] Are all tokens replaced?
- [ ] Are all user IDs replaced?
- [ ] Are field names preserved?
- [ ] Is object structure preserved?
- [ ] Can runtime types still be inferred?
- [ ] Is there any valid credential in the file?
