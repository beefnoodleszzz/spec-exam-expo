/**
 * Session Cleanup Coordinator & Unauthorized Handler
 *
 * Requirements:
 * 1. Immediate in-memory state invalidation (status = 'anonymous', token = null, profile = null).
 * 2. Immediate Query Cache clearance.
 * 3. Best-effort concurrent storage cleanup via Promise.allSettled with named tasks.
 * 4. Structured logging via logger.warn instead of console.warn.
 * 5. Single-flight promise lock (cleanupPromise) preventing duplicate parallel cleanup loops.
 */
import { sessionStore } from './session-store'
import { appStore } from './app-store'
import { queryClient } from '@/shared/query/query-client'
import { clearSecureCredentials } from '@/shared/persistence/secure-storage'
import { clearUserAsyncData } from '@/shared/persistence/async-storage'
import { setUnauthorizedHandler } from '@/shared/api/client/request'
import { logger } from '@/shared/logging/logger'

let cleanupPromise: Promise<void> | null = null

const cleanupTasks = [
  { name: 'secure_credentials', run: clearSecureCredentials },
  { name: 'user_async_data', run: clearUserAsyncData },
  { name: 'exam_profile', run: () => appStore.getState().removePersistedExamProfile() },
]

async function performCleanup(): Promise<void> {
  // 1. Immediately invalidate in-memory session status
  sessionStore.setState({
    status: 'anonymous',
    accessToken: null,
    userId: null,
  })

  // 2. Immediately clear in-memory Exam Profile
  appStore.getState().resetExamProfileState()

  // 3. Immediately clear Query Cache
  queryClient.clear()

  // 4. Best-effort concurrent persistence cleanup (storage failures do NOT throw or revert state)
  const results = await Promise.allSettled(cleanupTasks.map((t) => t.run()))

  // Log any persistence cleanup failures with task names
  results.forEach((result, idx) => {
    if (result.status === 'rejected') {
      const task = cleanupTasks[idx]
      logger.warn('session_cleanup_task_failed', {
        taskName: task?.name ?? 'unknown',
        error: result.reason,
      })
    }
  })
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
