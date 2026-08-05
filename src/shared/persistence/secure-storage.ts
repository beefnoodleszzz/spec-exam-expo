/**
 * Secure Storage — wraps expo-secure-store for sensitive credentials.
 *
 * Only small sensitive values should be stored here.
 * Do NOT store large objects, full user data, or question lists.
 */
import * as SecureStore from 'expo-secure-store'

export const SecureKeys = {
  ACCESS_TOKEN: 'sec_access_token',
  USER_ID: 'sec_user_id',
} as const

export type SecureKey = (typeof SecureKeys)[keyof typeof SecureKeys]

export async function setSecure(key: SecureKey, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value)
}

export async function getSecure(key: SecureKey): Promise<string | null> {
  return SecureStore.getItemAsync(key)
}

export async function deleteSecure(key: SecureKey): Promise<void> {
  await SecureStore.deleteItemAsync(key)
}

export async function clearSecureCredentials(): Promise<void> {
  await Promise.all([
    deleteSecure(SecureKeys.ACCESS_TOKEN),
    deleteSecure(SecureKeys.USER_ID),
  ])
}
