/**
 * Session Cleanup Coordinator & Unauthorized Handler
 *
 * Coordinates logout & 401 unauthorization across:
 * - SecureStore credentials
 * - AsyncStorage user data & snapshots
 * - TanStack Query Client cache
 * - App Store exam profile
 * - Session Store state
 */
import { sessionStore } from './session-store'
import { appStore } from './app-store'
import { queryClient } from '@/providers/QueryProvider'
import {
  clearSecureCredentials,
} from '@/shared/persistence/secure-storage'
import { clearUserAsyncData } from '@/shared/persistence/async-storage'
import { setUnauthorizedHandler } from '@/shared/api/client/request'

export async function clearAllSessionData(): Promise<void> {
  // 1. Clear SecureStore
  await clearSecureCredentials()

  // 2. Clear user AsyncStorage (snapshots, history)
  await clearUserAsyncData()

  // 3. Reset/Clear TanStack Query Cache (prevents data leak between users)
  queryClient.clear()

  // 4. Clear Exam Profile
  await appStore.getState().clearExamProfile()

  // 5. Update sessionStore state
  sessionStore.setState({
    status: 'anonymous',
    accessToken: null,
    userId: null,
  })
}

export function handleUnauthorizedEvent(): void {
  // Immediately set status to anonymous so route guard reacts
  sessionStore.setState({
    status: 'anonymous',
    accessToken: null,
    userId: null,
  })
  // Execute complete cleanup asynchronously
  void clearAllSessionData()
}

/**
 * Register unauthorized callback into HTTP client transport.
 * Call this during app bootstrap.
 */
export function registerUnauthorizedHandler(): void {
  setUnauthorizedHandler(handleUnauthorizedEvent)
}
