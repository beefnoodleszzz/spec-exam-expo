/**
 * Authentication payload schema — compatible parsing.
 *
 * Because Swagger data is unknown, this schema accepts multiple
 * field name variants from legacy backend responses.
 *
 * Evidence: docs/auth/legacy-auth-mapping.md
 */

import { z } from 'zod'
import type { AuthUser } from '../domain/auth.types'

/**
 * Login response payload (after envelope unwrapping).
 *
 * Token field variants from old project:
 * - token (most common)
 * - accesstoken (lowercase)
 *
 * User ID variants:
 * - userId
 * - id
 */
export const authLoginPayloadSchema = z
  .object({
    token: z.string().optional(),
    accesstoken: z.string().optional(),

    userId: z
      .union([z.string(), z.number()])
      .nullish(),
    userid: z
      .union([z.string(), z.number()])
      .nullish(),
    id: z.union([z.string(), z.number()]).nullish(),
  })
  .passthrough()

export type AuthLoginPayload = z.infer<
  typeof authLoginPayloadSchema
>

/**
 * User info payload variants.
 *
 * Field name variants:
 * - nickName vs nickname
 * - mobile vs phone
 * - img vs avatarUrl vs avatar vs headImg
 */
export const authUserPayloadSchema = z
  .object({
    id: z
      .union([z.string(), z.number()])
      .nullish(),
    userId: z
      .union([z.string(), z.number()])
      .nullish(),

    mobile: z.string().nullish(),
    phone: z.string().nullish(),
    phoneNumber: z.string().nullish(),

    nickName: z.string().nullish(),
    nickname: z.string().nullish(),

    avatar: z.string().nullish(),
    avatarUrl: z.string().nullish(),
    img: z.string().nullish(),
    headImg: z.string().nullish(),
  })
  .passthrough()

export type AuthUserPayload = z.infer<
  typeof authUserPayloadSchema
>

/**
 * Extract access token from login payload.
 *
 * Tries multiple field names in order:
 * token → accesstoken
 *
 * Throws if no token found.
 */
export function extractAccessToken(
  payload: AuthLoginPayload,
): string {
  const token =
    payload.token ?? payload.accesstoken

  if (!token || typeof token !== 'string') {
    throw new Error(
      'Login succeeded but no access token returned',
    )
  }

  return token
}

/**
 * Extract user ID from login payload.
 *
 * Tries multiple field names in order:
 * userId → userid → id
 *
 * Returns null if not found.
 */
export function extractUserId(
  payload: AuthLoginPayload,
): string | null {
  const value =
    payload.userId ??
    payload.userid ??
    payload.id

  if (value === null || value === undefined) {
    return null
  }

  return String(value)
}

/**
 * Map raw user payload to domain AuthUser.
 *
 * Handles field name variants and normalizes to single AuthUser structure.
 */
export function mapAuthUser(
  payload: AuthUserPayload,
): AuthUser {
  const id = String(
    payload.userId ?? payload.id,
  )

  return {
    id: id === 'undefined' ? null : id,
    phone:
      payload.mobile ?? payload.phone ?? null,
    nickname:
      payload.nickName ?? payload.nickname ?? null,
    avatarUrl:
      payload.avatarUrl ??
      payload.avatar ??
      payload.img ??
      payload.headImg ??
      null,
  }
}
