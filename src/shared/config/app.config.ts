import Constants from 'expo-constants'

type AppVariant = 'development' | 'production' | 'kaozhengtong'

const extra = Constants.expoConfig?.extra as {
  APP_VARIANT: AppVariant
  API_BASE_URL: string
  MAP_BASE_URL: string
  WEB_BASE_URL: string
  WECHAT_APP_ID: string
  CHECK_KEY: string
  UNIVERSAL_LINK_IOS: string
}

export const AppConfig = {
  APP_VARIANT: extra.APP_VARIANT ?? 'development',
  API_BASE_URL: extra.API_BASE_URL ?? 'https://ifch.i-cbao.com/ecsmotojk/api/',
  MAP_BASE_URL: extra.MAP_BASE_URL ?? 'https://ifch.i-cbao.com/vcomponent/api/',
  WEB_BASE_URL: extra.WEB_BASE_URL ?? 'https://fch.i-cbao.com/ecsmotojkweb/',
  WECHAT_APP_ID: extra.WECHAT_APP_ID ?? '',
  /**
   * Request signature key.
   * NOTE: This is a protocol parameter, not a real security secret.
   * It cannot be truly secret in a client app. Do not log raw value.
   */
  CHECK_KEY: extra.CHECK_KEY ?? '80306f4370b39fd5630ad0529f77adb6',
  UNIVERSAL_LINK_IOS: extra.UNIVERSAL_LINK_IOS ?? 'https://fch.i-cbao.com/specialworker/',
  /** Non-VIP max free practice count */
  MAX_FREE_PRACTICE: 18,
  /** Login system identifier (legacy backend expects 3) */
  SYSTEM: 3,
} as const

export type AppVariantType = AppVariant
