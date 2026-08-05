# Authentication Contract Analysis

## API Version Selection

This project uses **V2 endpoints**:

```text
/api/examV2/app/**
```

Legacy `/api/exam/**` endpoints are not used in this phase.

## Endpoint Mapping

### 1. Password Login

**Orval Function**: `apiExamV2AppLoginPost`

**Method**: POST

**Path**: `/api/examV2/app/login`

**Request DTO**: `ExaminationManageContractDtoUserUserLoginInput`

**Response DTO**: `AcbMiddleWareCoreResultModel`

**Envelope**: Contains `data` field with login result

**Token Field**: TBD from response fixture

**User ID Field**: TBD from response fixture

**Key Fields**:
- code (optional)
- system (optional)
- province (optional)
- examTypeId (optional)
- iptInviteCode (optional)

---

### 2. SMS Login

**Orval Function**: `apiExamV2AppLoginShortMessagePost`

**Method**: POST

**Path**: `/api/examV2/app/login/shortMessage`

**Request DTO**: `ExaminationManageContractDtoUserShortMessageLoginInput`

**Response DTO**: `AcbMiddleWareCoreResultModel`

**Envelope**: Contains `data` field with login result

**Token Field**: TBD from response fixture

**User ID Field**: TBD from response fixture

---

### 3. Send SMS Verification Code

**Orval Function**: `apiExamV2AppLoginSendShortMessageGet`

**Method**: GET

**Path**: `/api/examV2/app/login/sendShortMessage`

**Query Params**: `ApiExamV2AppLoginSendShortMessageGetParams`

**Response DTO**: `AcbMiddleWareCoreResultModel`

**Envelope**: Contains `data` field (typically empty for success)

---

### 4. Get Current User Info

**Orval Function**: `apiExamV2AppLoginGetUserInfoByTokenGet`

**Method**: GET

**Path**: `/api/examV2/app/login/getUserInfoByToken`

**Response DTO**: `AcbMiddleWareCoreResultModel`

**Envelope**: Contains `data` field with user info

**User DTO**: TBD from response fixture

**Key Fields**:
- phone (phone number)
- id (user ID)
- nickname (nickname)
- avatarUrl (avatar URL)

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
