# Legacy Auth Implementation Mapping

## Project Reference

**Old Project:** `/Users/zhangxiaolong/Desktop/spec-exam-pure`

Key files analyzed:
- `src/solution/model/services/login.service.ts`
- `src/solution/model/dto/login.dto.ts`
- `src/solution/hooks/userLoginHooks.tsx`
- `src/framework/util/base-http/request.service.ts`
- `src/solution/pages/login-component/login.component.store.ts`

---

## Login Endpoints

| Endpoint | Method | Purpose | Old File |
|----------|--------|---------|----------|
| examV2/app/login | GET | WeChat authorization code login | login.service.ts:13 |
| examV2/app/login/shortMessage | POST | SMS verification code login | login.service.ts:15 |
| examV2/app/login/sendShortMessage | GET | Send verification code to phone | login.service.ts:16 |
| examV2/app/login/oneClickLogin | POST | One-click phone number login | login.service.ts:17 |
| examV2/app/login/getUserInfoByToken | GET | Get current user info (legacy name) | - |
| examV2/app/user/detail | GET | Get user detail (actually used) | login.service.ts:20 |

---

## Login Request Mapping

### Short Message Login

**Old:** `getUserLogin(params: Partial<LoginParams>)`

**Old LoginParams:**

```ts
{
  mobile: string           // phone number from input
  code: string             // verification code from input
  provinceCode: string     // from exam registration info
  requestId: string        // from sendShortMessage response
  system: number           // hardcoded to 3
  province: string         // from exam registration info
  examTypeId: string       // from exam registration info
  iptInviteCode: string    // from exam registration info (renamed from inviteCode)
  headImg?: string         // user avatar if available
  terminal: string         // JSON.stringify(Platform.constants)
  clientType: number       // 1 for Android, 2 for iOS
}
```

**New Mapping:**

Domain `ShortMessageLoginCommand`:

```ts
interface ShortMessageLoginCommand {
  phone: string
  verificationCode: string    // maps to 'code'
  system?: number             // optional, default 3
  province?: string
  provinceCode?: string
  examTypeId?: string
  inviteCode?: string         // maps to iptInviteCode
  terminal?: string
  clientType?: number
}
```

Request Mapper maps to Generated DTO:

```ts
{
  mobile: phone
  code: verificationCode
  provinceCode
  system
  province
  examTypeId
  iptInviteCode: inviteCode    // critical mapping
  headImg
  terminal
  clientType
}
```

### One-Click Login

**Old:** `getPhoneOneClickLogin(params: Partial<LoginParams>)`

**Key difference:**
- Uses `accessToken` from phone auth SDK instead of `code`
- Same other parameters as SMS login

Domain `OneClickLoginCommand`:

```ts
interface OneClickLoginCommand {
  accessToken: string    // from phone SDK (not user input)
  system?: number
  province?: string
  provinceCode?: string
  examTypeId?: string
  terminal?: string
  clientType?: number
}
```

### WeChat Code Login

**Old:** `getUserInfo(params: {code: string})`

**Note:** Called after obtaining code from WeChat auth

Domain `V2LoginCommand`:

```ts
interface V2LoginCommand {
  code: string        // from WeChat SDK
  system?: number
  province?: string
  provinceCode?: string
  examTypeId?: string
  inviteCode?: string
  terminal?: string
  clientType?: number
}
```

---

## Send Verification Code

**Old:** `getSendShortMessage(params: {mobile: string})`

**Response:**

```ts
interface AliyunSmsDto {
  message: string
  requestId: string      // must be captured and passed to login
  bizId: string
  code: string
}
```

**New Domain:**

```ts
interface SendShortMessageCommand {
  phone: string
}

// Response type
interface SmsResponse {
  requestId: string
}
```

---

## Login Response Parsing

### Old Response

```ts
interface ILoginResponse {
  id?: string
  token?: string
  accesstoken?: string
}
```

**Critical Finding:** Token field is one of:
- `token`
- `accesstoken` (lowercase)

No `examToken` or `examtoken` in response. Those are request headers only.

### New Payload Schema

```ts
const authLoginPayloadSchema = z.object({
  token: z.string().optional(),
  accesstoken: z.string().optional(),
  id: z.union([z.string(), z.number()]).optional(),
  
  // Old code used both variants
  userId: z.union([z.string(), z.number()]).optional(),
  userid: z.union([z.string(), z.number()]).optional(),
})
```

### Token Extraction

**Rule:** Must have non-empty token from response

```ts
export function extractAccessToken(
  payload: AuthLoginPayload,
): string {
  const token = payload.token ?? payload.accesstoken
  if (!token) {
    throw createContractError('No token in login response')
  }
  return token
}
```

### User ID Extraction

**Rule:** Store whatever ID is returned

```ts
export function extractUserId(
  payload: AuthLoginPayload,
): string | null {
  const id = payload.id ?? payload.userId ?? payload.userid
  return id ? String(id) : null
}
```

---

## User Info Response

**Old:** Called getUserDetail() after login

**Response structure:** Must include `status` or `id`

```ts
interface UserDetail {
  status?: boolean | number
  id?: string
  nickName?: string
  mobile?: string
  img?: string
  sex?: string
  inviteCode?: string
  isVip?: boolean
  expirationTime?: string
  examTime?: string
  system?: number
}
```

**New Domain:**

```ts
interface AuthUser {
  id: string | null
  phone: string | null          // from 'mobile' or 'phone'
  nickname: string | null       // from 'nickName'
  avatarUrl: string | null      // from 'img' or 'avatar'
}
```

---

## Request Headers

### Created for every HTTP request

```ts
headers = {
  examtoken: '<token>',       // from USER_INFO_DETAIL storage
  'Content-Type': 'application/json',
  examTypeId: '<id>',         // from REGISTER_FOR_EXAMINATION_INFO
  random1: number,            // random 0-99
  random2: number,            // random 0-99
  checkResult: string,        // FuckingDSign(random1, random2, CHECK_KEY)
}
```

**New Pattern:**

These headers are still required. Keep in request.ts mutator.

---

## Session Persistence

### Storage Key

**Old:** `USER_INFO_DETAIL` in AsyncStorage

```ts
StorageUtil.setLocalStorage(
  USER_INFO_DETAIL,
  JSON.stringify({
    ...userToken,      // ILoginResponse {token, id}
    ...userDetail,     // UserDetail
  })
)
```

**New:**

- Access Token → SecureStore (sensitive)
- User ID → SecureStore or AppStore (small)
- User Info → AppStore (small profile summary)

Session persistence schema:

```ts
interface SessionPersistence {
  accessToken: string
  userId: string | null
  userInfo?: {
    nickname?: string
    phone?: string
    avatarUrl?: string
  }
}
```

---

## Post-Login Behavior

### Old Flow

1. `getUserTokenByPhone()` → calls login endpoint
2. Stores response in `userToken.current`
3. Calls `getUserInfoByToken()` (actually `getUserDetail()`)
4. Merges responses and stores in AsyncStorage
5. Dispatches Redux action `setLoginStateAction(dispatch, true)`
6. Dispatches `setWeChatUserInfo(dispatch, mergedData)`
7. Emits DeviceEventEmitter: `'refresh-UserInfo'`, `'refresh-VehicleGeneral'`
8. Navigates to `'Home'`
9. Toast hidden

### New Flow

Must preserve:

```ts
// After login succeeds
1. Persist token to SecureStore
2. Persist user ID to SessionStore
3. Call getUserInfoByToken to populate user profile
4. On success: navigate to '/(protected)/home'
5. On 401: clear session, navigate to '/(public)/sign-in'
6. On error: show error toast, stay on login
```

---

## Client Metadata

### System ID

**Fixed value:** `3`

Source: `const SYSTEM = 3` in login.service.ts:12

### Platform/Terminal

**Terminal field:**

```ts
terminal: JSON.stringify(Platform.constants)
```

Passed for every login attempt.

**ClientType:**

```ts
clientType: Platform.OS === 'android' ? 1 : 2
```

- Android: `1`
- iOS: `2`

### Exam Context

All login requests MUST include:

```ts
{
  examTypeId: string        // from registration
  province: string
  provinceCode: string
  iptInviteCode: string     // invitation code if present
}
```

These are NOT from user input, but from `REGISTER_FOR_EXAMINATION_INFO` storage.

---

## Logout

**Old:**

```ts
// No explicit logout endpoint
// Simply clear storage and navigate back
StorageUtil.removeItem(USER_INFO_DETAIL)
```

**New:**

```ts
// clearSession() should:
// 1. Clear SecureStore token
// 2. Clear SessionStore
// 3. Clear Query Cache
// 4. Navigate to sign-in
```

---

## Verification Code Flow

### Countdown

**Old:** Starts at 60 seconds, decrements every 1000ms

```ts
let timer = null

function t() {
  return setInterval(
    () => setStateWrap({coutDown: --coutDown}),
    1000
  )
}

// When getValidCode clicked
timer = t()

// When coutDown <= 0
clearInterval(timer)
timer = null
setStateWrap({watingForCode: false, coutDown: 60})
```

### Phone Validation

**Pattern:** `/(1[3-9])\d{9}$/`

Allows 11-digit Chinese mobile numbers starting with 1[3-9].

### Request ID Handling

When `getSendShortMessage` succeeds:

```ts
const {requestId, code} = response
loginParams.current.requestId = requestId
```

Then `requestId` is passed to login endpoint.

---

## Error Handling

### Old: Generic errors

```ts
// On error: show toast with message
$toast?.show('请输入正确的号码', 1000)
$toast?.show('请输入验证码！', 1000)
```

### New: Contract-aware errors

```ts
// Business errors from server
// HTTP errors (network, timeout)
// Validation errors (phone format, required fields)
```

---

## Device Event Emitters

**Old:**

```ts
DeviceEventEmitter.emit('refresh-UserInfo', 'refresh')
DeviceEventEmitter.emit('refresh-VehicleGeneral', 'refresh')
```

**Note:** These trigger data refresh on other screens.

**New:** Use React Query invalidation instead.

---

## WeChat Integration

**Old:** Has `wechatLogin` and `getUserTokenByWechatCode`

**New:** May not implement in v1, but structure must support:

```ts
// 1. Call WeChat SDK to get code
// 2. POST code to /examV2/app/login
// 3. Proceed to getUserInfoByToken
```

---

## Configuration Summary

| Item | Value | Source |
|------|-------|--------|
| System ID | 3 | login.service.ts:12 |
| Phone Regex | `/(1[3-9])\d{9}$/` | login.component.store.ts:14 |
| Countdown | 60 seconds | login.component.store.ts:43 |
| Token Header | `examtoken` (lowercase) | request.service.ts:21 |
| Storage Key | `USER_INFO_DETAIL` | login.service.ts:4 |
| Success Route | `Home` | userLoginHooks.tsx:152 |
| Token Fields | `token` or `accesstoken` | login.dto.ts:28-29 |
| ID Field | `id` | login.dto.ts:27 |
| Device Type | 1=Android, 2=iOS | userLoginHooks.tsx:90 |

---

## Decisions for New Project

1. **Token Header**: Keep `examtoken` in request.ts
2. **Storage**: Migrate to SecureStore + SessionStore
3. **UI**: Implement SMS login first (most used)
4. **Navigation**: Expo Router, not React Navigation
5. **State**: Zustand, not Redux
6. **HTTP**: Orval + TanStack Query, not RxJS
7. **Validation**: Zod schema, not custom regex
8. **User Info**: Minimal AuthUser interface, expandable

---

## Testing Checklist

- [ ] Send SMS verification code
- [ ] Countdown timer 60s
- [ ] Phone input validation
- [ ] Verification code input
- [ ] Login success with SMS
- [ ] Token persisted to SecureStore
- [ ] User info fetched and stored
- [ ] Navigation to protected route
- [ ] Cold start restores session
- [ ] 401 clears session
- [ ] Logout clears everything
- [ ] iOS and Android tested
