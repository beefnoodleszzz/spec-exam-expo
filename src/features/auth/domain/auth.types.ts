/**
 * Authentication domain contracts.
 *
 * Confirmed from legacy project analysis: docs/auth/legacy-auth-mapping.md
 */

/**
 * Authentication session — minimal required fields.
 *
 * Contains user identity and access credentials.
 * Additional user info fetched via separate endpoint.
 *
 * Evidence: legacy spec-exam-pure/ILoginResponse
 */
export interface AuthSession {
  accessToken: string
  userId: string | null
}

/**
 * User profile information.
 *
 * Fetched from getUserInfoByToken or user/detail endpoint.
 * Minimal set of fields used across app.
 *
 * Evidence: legacy UserDetail structure (spec-exam-pure)
 */
export interface AuthUser {
  id: string | null
  phone: string | null
  nickname: string | null
  avatarUrl: string | null
}

/**
 * Short message (SMS) login request.
 *
 * User-provided: phone, verificationCode
 * Auto-filled: system, province, examTypeId, etc. via config
 *
 * Evidence: legacy LoginParams (spec-exam-pure login.dto.ts:39)
 */
export interface ShortMessageLoginCommand {
  phone: string
  verificationCode: string
  system?: number
  province?: string
  provinceCode?: string
  examTypeId?: string
  inviteCode?: string
  terminal?: string
  clientType?: number
}

/**
 * V2 WeChat code login request.
 *
 * Evidence: legacy getUserInfo endpoint (login.service.ts:43)
 */
export interface V2LoginCommand {
  code: string
  system?: number
  province?: string
  provinceCode?: string
  examTypeId?: string
  inviteCode?: string
  terminal?: string
  clientType?: number
}

/**
 * One-click phone login request.
 *
 * Uses OS-provided phone token instead of user verification code.
 *
 * Evidence: legacy getPhoneOneClickLogin (userLoginHooks.tsx:110)
 */
export interface OneClickLoginCommand {
  accessToken: string
  system?: number
  province?: string
  provinceCode?: string
  examTypeId?: string
  terminal?: string
  clientType?: number
}

/**
 * Send SMS verification code request.
 *
 * Evidence: legacy getSendShortMessage (login.service.ts:39)
 */
export interface SendShortMessageCommand {
  phone: string
}

/**
 * Tracking auth contract evidence sources.
 */
export interface AuthContractEvidence {
  source: string
  timestamp: string
  note: string
}
