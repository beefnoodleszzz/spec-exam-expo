/**
 * Session Cleanup Coordinator & Unauthorized Handler
 *
 * Requirements (from review.md P0-2 & P2-2):
 * 1. Immediate in-memory state invalidation (status = 'anonymous', token = null, profile = null).
 * 2. Immediate Query Cache clearance.
 * 3. Best-effort concurrent storage cleanup via Promise.allSettled.
 * 4. Single-flight promise lock (cleanupPromise) preventing duplicate parallel cleanup loops.
 * 5. Storage errors do NOT revert auth status or block memory cleanup.
 */
import { sessionStore } from './session-store'
import { appStore } from './app-store'
import { queryClient } from '@/shared/query/query-client'
import { clearSecureCredentials } from '@/shared/persistence/secure-storage'
import { clearUserAsyncData } from '@/shared/persistence/async-storage'
import { setUnauthorizedHandler } from '@/shared/api/client/request'

let cleanupPromise: Promise<void> | null = null

async function performCleanup(): Promise<void> {
  // 1. Immediately invalidate in-memory session status
  sessionStore.setState({
    status: 'anonymous',
    accessToken: null,
    userId: null,
  })

  // 2. Immediately clear in-memory Exam Profile
  appStore.getState().clearExamProfileMemory()

  // 3. Immediately clear Query Cache
  queryClient.clear()

  // 4. Best-effort concurrent persistence cleanup (storage failures do NOT throw or revert state)
  const results = await Promise.allSettled([
    clearSecureCredentials(),
    clearUserAsyncData(),
    appStore.getState().clearPersistedExamProfile(),
  ])

  // Log any persistence cleanup failures for diagnostic purposes
  for (const result of results) {
    if (result.status === 'rejected') {
      console.warn('Session persistence cleanup error (ignored):', result.reason)
    }
  }
}

/**
 * Execute complete session cleanup with single-flight promise lock.
 */
export function clearAllSessionData(): Promise<void> {
  if (cleanupPromise) {
    return cleanupPromise
  }

  cleanupPromise = performCleanup().finally(() => {
    cleanupPromise = null
  })

  return cleanupPromise
}

export function handleUnauthorizedEvent(): void {
  void clearAllSessionData()
}

/**
 * Register unauthorized callback into HTTP client transport.
 * Call this during app bootstrap.
 */
export function registerUnauthorizedHandler(): void {
  setUnauthorizedHandler(handleUnauthorizedEvent)
}
