/**
 * Zod schema for persisted auth user profile.
 *
 * Used to validate data read from AsyncStorage on restore.
 * Prevents silent contract coercion via unsafe JSON.parse cast.
 */

import { z } from 'zod'

export const persistedAuthUserSchema = z.object({
  id: z.string().nullable(),
  phone: z.string().nullable(),
  nickname: z.string().nullable(),
  avatarUrl: z.string().nullable(),
})

export type PersistedAuthUser = z.infer<typeof persistedAuthUserSchema>
