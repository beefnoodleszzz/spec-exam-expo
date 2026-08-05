/**
 * Async Storage — wraps @react-native-async-storage/async-storage for non-sensitive state.
 *
 * Rules:
 * - Only small JSON-serializable values (< ~64KB).
 * - No tokens, no large lists, no complete question banks.
 * - Each entry must include schemaVersion for migration.
 */
import AsyncStorage from '@react-native-async-storage/async-storage'

export const AsyncKeys = {
  PRIVACY_VERSION: 'async_privacy_version',
  FIRST_LAUNCH_DONE: 'async_first_launch_done',
  EXAM_PROFILE_SUMMARY: 'async_exam_profile_summary',
  SEARCH_HISTORY: 'async_search_history',
  PRACTICE_SNAPSHOT: 'async_practice_snapshot',
  SIMULATION_SNAPSHOT: 'async_simulation_snapshot',
  THEME_MODE: 'async_theme_mode',
} as const

export type AsyncKey = (typeof AsyncKeys)[keyof typeof AsyncKeys]

export async function setAsync<T>(key: AsyncKey, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value))
}

export async function getAsync<T>(key: AsyncKey): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key)
  if (raw == null) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function removeAsync(key: AsyncKey): Promise<void> {
  await AsyncStorage.removeItem(key)
}

export async function clearUserAsyncData(): Promise<void> {
  await Promise.all([
    removeAsync(AsyncKeys.PRACTICE_SNAPSHOT),
    removeAsync(AsyncKeys.SIMULATION_SNAPSHOT),
    removeAsync(AsyncKeys.EXAM_PROFILE_SUMMARY),
    removeAsync(AsyncKeys.SEARCH_HISTORY),
  ])
}
