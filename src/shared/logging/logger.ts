/**
 * Structured Logger — Centralized logging utility.
 * Sanitizes errors and avoids logging tokens or sensitive user data in production.
 */

export interface LogContext {
  [key: string]: unknown
}

function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Unknown error'
}

export const logger = {
  info(event: string, context?: LogContext): void {
    if (__DEV__) {
      console.log(`[INFO] [${event}]`, context ?? '')
    }
  },

  warn(event: string, context?: LogContext): void {
    if (__DEV__) {
      console.warn(`[WARN] [${event}]`, context ?? '')
    }
  },

  error(event: string, error?: unknown, context?: LogContext): void {
    const sanitizedMsg = error ? sanitizeError(error) : undefined
    if (__DEV__) {
      console.error(`[ERROR] [${event}]`, sanitizedMsg, context ?? '')
    }
    // Production Sentry integration placeholder
  },
}
