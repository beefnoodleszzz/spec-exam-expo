import { QueryClient } from '@tanstack/react-query'
import { isAppError } from '@/shared/api/errors/app-error'

/**
 * Global TanStack Query Client instance.
 * Decoupled from React Provider tree so auth/session service can import it cleanly.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) => {
        if (isAppError(error)) {
          // Only retry retryable errors (network, timeout, server 5xx)
          if (!error.retryable) return false
        }
        return failureCount < 3
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    },
    mutations: {
      // No automatic retry for mutations (payment, order creation, exam submission, etc.)
      retry: false,
    },
  },
})
