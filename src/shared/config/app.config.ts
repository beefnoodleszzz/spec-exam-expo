import Constants from 'expo-constants'

type AppVariant = 'development' | 'production' | 'kaozhengtong'

const extra = Constants.expoConfig?.extra as {
  APP_VARIANT: AppVariant
  API_BASE_URL: string
  MAP_BASE_URL: string
  WEB_BASE_URL: string
  WECHAT_APP_ID: string
  LEGACY_CHECK_KEY: string
  UNIVERSAL_LINK_IOS: string
}

export const AppConfig = {
  APP_VARIANT: extra?.APP_VARIANT ?? 'development',
  API_BASE_URL: extra?.API_BASE_URL ?? 'https://ifch.i-cbao.com/ecsmotojk/api/',
  MAP_BASE_URL: extra?.MAP_BASE_URL ?? 'https://ifch.i-cbao.com/vcomponent/api/',
  WEB_BASE_URL: extra?.WEB_BASE_URL ?? 'https://fch.i-cbao.com/ecsmotojkweb/',
  WECHAT_APP_ID: extra?.WECHAT_APP_ID ?? '',
  /**
   * LEGACY PROTOCOL PARAMETER (Formerly CHECK_KEY)
   *
   * SECURITY NOTICE:
   * This parameter is a legacy backend request signature salt shipped in client apps.
   * It is NOT a server secret and CANNOT be kept secret in any client binary.
   * Do NOT treat this as a confidential secret or put it into secure vault storage.
   * Do NOT print this value in client logs.
   */
  LEGACY_CHECK_KEY: extra?.LEGACY_CHECK_KEY ?? '80306f4370b39fd5630ad0529f77adb6',
  UNIVERSAL_LINK_IOS: extra?.UNIVERSAL_LINK_IOS ?? 'https://fch.i-cbao.com/specialworker/',
  /** Non-VIP max free practice count */
  MAX_FREE_PRACTICE: 18,
  /** Login system identifier (legacy backend expects 3) */
  SYSTEM: 3,
} as const

export type AppVariantType = AppVariant
