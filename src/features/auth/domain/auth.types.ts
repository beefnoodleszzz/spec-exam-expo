/**
 * Authentication domain contracts.
 *
 * Only stable contracts confirmed independently from the backend payload
 * belong in this file.
 *
 * Login commands and user-profile fields remain undefined until real,
 * sanitized backend responses are captured and reviewed.
 */

export interface AuthSession {
  accessToken: string
  userId: string | null
}

export interface AuthContractEvidence {
  source:
    | 'swagger'
    | 'sanitized-response'
    | 'backend-documentation'
  capturedAt: string
  endpoint: string
}
