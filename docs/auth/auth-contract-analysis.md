# Authentication Contract Analysis

## API Version Selection

This project uses **V2 endpoints**:

```text
/api/examV2/app/**
```

Legacy `/api/exam/**` endpoints are not used in this phase.

## Endpoint Mapping

### 1. V2 Login

**Orval Function**: `apiExamV2AppLoginPost`

**Method**: POST

**Path**: `/api/examV2/app/login`

**Request DTO**: `ExaminationManageContractDtoUserUserLoginInput`

| Field | Type | Required | Description | Confirmed |
|---|---|---:|---|---|
| code | string | No | Unknown meaning | Requires fixture |
| system | Enum | No | Client system type | Requires documentation |
| province | string | No | 省（Province） | Schema documented |
| provinceCode | string | No | 省 Code | Schema documented |
| examTypeId | string | No | 科目 ID | Schema documented |
| iptInviteCode | string | No | Input invite code | Schema documented |
| terminal | string | No | Terminal identifier | Requires fixture |
| clientType | Enum | No | Client type | Requires documentation |
| package | string | No | Package name | Requires fixture |

**Response DTO**: `AcbMiddleWareCoreResultModel`

**Token Field**: **UNKNOWN** — Must extract from response fixture

**User ID Field**: **UNKNOWN** — Must extract from response fixture

---

### 2. V2 Short Message Login

**Orval Function**: `apiExamV2AppLoginShortMessagePost`

**Method**: POST

**Path**: `/api/examV2/app/login/shortMessage`

**Request DTO**: `ExaminationManageContractDtoUserShortMessageLoginInput`

| Field | Type | Required | Description | Confirmed |
|---|---|---:|---|---|
| mobile | string | No | **UNKNOWN** — Phone or mobile identifier | Requires fixture |
| code | string | No | **UNKNOWN** — Verification code or other | Requires fixture |
| requestId | string | No | Request identifier | Requires documentation |
| system | Enum | No | Client system type | Requires documentation |
| province | string | No | 省（Province） | Schema documented |
| provinceCode | string | No | 省 Code | Schema documented |
| examTypeId | string | No | 科目 ID | Schema documented |
| headImg | string | No | 头像（Avatar） | Schema documented |
| iptInviteCode | string | No | Input invite code | Schema documented |
| terminal | string | No | Terminal identifier | Requires fixture |
| clientType | Enum | No | Client type | Requires documentation |

**Response DTO**: `AcbMiddleWareCoreResultModel`

**Token Field**: **UNKNOWN** — Must extract from response fixture

**User ID Field**: **UNKNOWN** — Must extract from response fixture

---

### 3. Send SMS Verification Code

**Orval Function**: `apiExamV2AppLoginSendShortMessageGet`

**Method**: GET

**Path**: `/api/examV2/app/login/sendShortMessage`

**Query Params**: `ApiExamV2AppLoginSendShortMessageGetParams`

| Field | Type | Required | Description | Confirmed |
|---|---|---:|---|---|
| mobile | string | No | **UNKNOWN** — Phone or mobile identifier | Requires fixture |

**Response DTO**: `AcbMiddleWareCoreResultModel`

**Envelope**: Contains `data` field (structure unknown until fixture received)

**Success Indicator**: **UNKNOWN** — Examine response envelope structure from fixture

---

### 4. WeChat One-Click Login

**Orval Function**: `apiExamV2AppLoginOneClickLoginPost`

**Method**: POST

**Path**: `/api/examV2/app/login/oneClickLogin`

**Request DTO**: `ExaminationManageContractDtoWeChatOneClickInput`

| Field | Type | Required | Description | Confirmed |
|---|---|---:|---|---|
| accessToken | string | No | **UNKNOWN** — WeChat access token or other | Requires fixture |
| system | Enum | No | Client system type | Requires documentation |
| mobile | string | No | Mobile or phone identifier | Requires fixture |
| province | string | No | 省（Province） | Schema documented |
| provinceCode | string | No | 省 Code | Schema documented |
| examTypeId | string | No | 科目 ID | Schema documented |
| headImg | string | No | 头像（Avatar） | Schema documented |
| iptInviteCode | string | No | Input invite code | Schema documented |
| version | string | No | Version number | Requires documentation |
| terminal | string | No | Terminal identifier | Requires fixture |
| clientType | Enum | No | Client type | Requires documentation |

**Response DTO**: `AcbMiddleWareCoreResultModel`

**Token Field**: **UNKNOWN** — Must extract from response fixture

**User ID Field**: **UNKNOWN** — Must extract from response fixture

---

### 5. Get Current User Info

**Orval Function**: `apiExamV2AppLoginGetUserInfoByTokenGet`

**Method**: GET

**Path**: `/api/examV2/app/login/getUserInfoByToken`

**Response DTO**: `AcbMiddleWareCoreResultModel`

**Envelope**: Contains `data` field with user info

**User DTO Structure**: **UNKNOWN** — Must extract from response fixture

Fields present in response cannot be guessed:
- Which fields exist
- Whether phone is present
- Whether ID is present
- Whether nickname/avatar are present
- What types they are

---

## DTO Type References

### Response Envelope

All login endpoints return:

```ts
AcbMiddleWareCoreResultModel {
  status?: boolean
  code?: string | number
  message?: string
  data?: unknown
}
```

The `data` field contains the actual response payload.

### Request DTOs

See generated models:
- `src/shared/api/generated/models/examinationManageContractDtoUserUserLoginInput.ts`
- `src/shared/api/generated/models/examinationManageContractDtoUserShortMessageLoginInput.ts`
- `src/shared/api/generated/models/apiExamV2AppLoginSendShortMessageGetParams.ts`

---

## Missing Information

The following fields require **real response fixtures** to determine:

- [ ] Login success response — Token field name and type
- [ ] Login success response — User ID field name and type
- [ ] User info response — Complete user DTO structure
- [ ] SMS send response — Success indicator format
- [ ] Business error response — Error code format
- [ ] Unauthorized response — 401 error format

These must be obtained from:
1. Actual backend test response
2. Swagger example field (if present)
3. Backend team documentation

Do NOT guess these fields.

---

## Session Integration Requirements

After successful login:

1. Extract token from response `data` field
2. Extract user ID from response `data` field
3. Call `sessionStore.setSession({ accessToken: token, userId })`
4. Call `appStore.setCurrentExamProfile({ examTypeId, ... })`
5. Navigate to protected area

On logout:

1. Call `sessionStore.logout()`
2. Navigate to public area

---

## Error Handling

### HTTP 401 (Unauthorized)

- Trigger `setUnauthorizedHandler()` callback
- Clear session
- Navigate to login

### Envelope Business Error

- Extract error code and message
- Throw AppError with kind: 'business'
- UI displays error message

### Network Errors

- Timeout, canceled, or network failure
- UI shows appropriate error state
- Retry is user-initiated

---

## Testing Strategy

1. Mock Orval functions with real response fixtures
2. Test adapter mapping from Generated DTO to Domain Model
3. Test session store integration
4. Test error handling paths
5. Test concurrent login requests (single-flight)

See:
- `src/features/auth/data/__fixtures__/`
- `src/features/auth/data/__tests__/auth.remote.test.ts`
