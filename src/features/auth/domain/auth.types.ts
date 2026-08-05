/**
 * Authentication domain types — stable business models
 * Decoupled from Generated DTO and HTTP layer.
 */

export interface AuthSession {
  accessToken: string
  userId: string | null
}

export interface AuthUser {
  id: string | null
  phone: string | null
  nickname: string | null
  avatarUrl: string | null
}

export interface PasswordLoginCommand {
  phone: string
  password: string
  examTypeId?: string
  system?: string
  province?: string
  provinceCode?: string
}

export interface SmsLoginCommand {
  phone: string
  verificationCode: string
  examTypeId?: string
  system?: string
  province?: string
  provinceCode?: string
}

export interface SendSmsCommand {
  phone: string
}

export interface OneClickLoginCommand {
  token: string
}
