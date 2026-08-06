/**
 * Structured Logger — Centralized logging utility.
 * Sanitizes errors and avoids logging tokens or sensitive user data in production.
 */

export interface LogContext {
  [key: string]: unknown
}

export interface SafeErrorInfo {
  name?: string
  message: string
  code?: string
}

export function sanitizeError(error: unknown): SafeErrorInfo {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    }
  }
  if (typeof error === 'string') {
    return {
      message: error,
    }
  }
  return {
    message: 'Unknown error',
  }
}

export const logger = {
  info(_event: string, _context?: LogContext): void {
    if (__DEV__) {
      // Remove console.log entirely or leave empty if required
    }
  },

  warn(event: string, context?: LogContext): void {
    if (__DEV__) {
      console.warn(`[WARN] [${event}]`, context ?? '')
    }
  },

  error(event: string, context?: LogContext): void {
    if (__DEV__) {
      console.error(`[ERROR] [${event}]`, context ?? '')
    }
    // Production Sentry integration placeholder
  },
}
