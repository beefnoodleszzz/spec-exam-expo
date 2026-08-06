/**
 * Authentication client configuration.
 *
 * Device and platform metadata sent with every auth request.
 * These are NOT user inputs, but environment constants.
 *
 * Evidence: legacy userLoginHooks.tsx and login.service.ts
 */

import { Platform } from 'react-native'
import Constants from 'expo-constants'

export interface AuthClientConfig {
  system: number
  clientType: number
  terminal: string
  province: string | undefined
  provinceCode: string | undefined
  examTypeId: string | undefined
  inviteCode: string | undefined
  packageName: string | undefined
}

/**
 * Get client configuration for auth requests.
 *
 * System ID: hardcoded to 3 (from legacy project)
 * ClientType: 1 for Android, 2 for iOS
 * Terminal: Device info serialized as JSON
 */
export function getAuthClientConfig(): AuthClientConfig {
  const clientType =
    Platform.OS === 'android' ? 1 : 2

  const terminal = JSON.stringify({
    os: Platform.OS,
    version: Platform.Version,
    appVersion:
      Constants.expoConfig?.version ?? '0.0.0',
  })

  return {
    system: 3,
    clientType,
    terminal,
    province: undefined,
    provinceCode: undefined,
    examTypeId: undefined,
    inviteCode: undefined,
    packageName:
      Constants.expoConfig?.name ??
      'spec-exam-expo',
  }
}

/**
 * Merge exam context (province, examTypeId, etc.)
 * with client config for auth requests.
 *
 * Called by Request Mapper to fill in optional fields.
 */
export function mergeExamContext(
  config: AuthClientConfig,
  context?: {
    province?: string
    provinceCode?: string
    examTypeId?: string
    inviteCode?: string
  },
): AuthClientConfig {
  return {
    ...config,
    province: context?.province ?? undefined,
    provinceCode:
      context?.provinceCode ?? undefined,
    examTypeId:
      context?.examTypeId ?? undefined,
    inviteCode:
      context?.inviteCode ?? undefined,
  }
}
