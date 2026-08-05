import type { ExpoConfig, ConfigContext } from 'expo/config'

type AppVariant = 'development' | 'production' | 'kaozhengtong'

const APP_VARIANT = (process.env.APP_VARIANT ?? 'development') as AppVariant

interface VariantConfig {
  name: string
  slug: string
  scheme: string
  iosBundleIdentifier: string
  androidPackage: string
  apiBaseUrl: string
  mapBaseUrl: string
  webBaseUrl: string
  wechatAppId: string
  easProjectId: string
}

const VARIANTS: Record<AppVariant, VariantConfig> = {
  development: {
    name: '特种作业(Dev)',
    slug: 'spec-exam-expo-dev',
    scheme: 'specialwork.dev',
    iosBundleIdentifier: 'com.specialwork.expo.dev',
    androidPackage: 'com.specialwork.expo.dev',
    apiBaseUrl: 'https://ifch.i-cbao.com/ecsmotojk/api/',
    mapBaseUrl: 'https://ifch.i-cbao.com/vcomponent/api/',
    webBaseUrl: 'https://fch.i-cbao.com/ecsmotojkweb/',
    wechatAppId: 'REPLACE_WITH_WECHAT_APP_ID',
    easProjectId: 'REPLACE_WITH_EAS_PROJECT_ID',
  },
  production: {
    name: '特种作业考证通',
    slug: 'spec-exam-expo',
    scheme: 'specialwork',
    iosBundleIdentifier: 'com.specialwork.expo',
    androidPackage: 'com.specialwork.expo',
    apiBaseUrl: 'https://iservice.enchunsi.com/ecsmotojk/api/',
    mapBaseUrl: 'https://ifch.i-cbao.com/vcomponent/api/',
    webBaseUrl: 'https://service.enchunsi.com/ecsmotojkweb/',
    wechatAppId: 'REPLACE_WITH_WECHAT_APP_ID',
    easProjectId: 'REPLACE_WITH_EAS_PROJECT_ID',
  },
  kaozhengtong: {
    name: '特种作业考证通',
    slug: 'spec-exam-expo-kzt',
    scheme: 'kaozhengtong',
    iosBundleIdentifier: 'com.kaozhengtong.expo',
    androidPackage: 'com.kaozhengtong.expo',
    apiBaseUrl: 'https://ifch.i-cbao.com/ecsmotojk/api/',
    mapBaseUrl: 'https://ifch.i-cbao.com/vcomponent/api/',
    webBaseUrl: 'https://fch.i-cbao.com/ecsmotojkweb/',
    wechatAppId: 'REPLACE_WITH_WECHAT_APP_ID',
    easProjectId: 'REPLACE_WITH_EAS_PROJECT_ID',
  },
}

const variant = VARIANTS[APP_VARIANT]

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: variant.name,
  slug: variant.slug,
  version: '1.0.0',
  orientation: 'portrait',
  scheme: variant.scheme,
  userInterfaceStyle: 'light',
  icon: './assets/icon.png',
  ios: {
    bundleIdentifier: variant.iosBundleIdentifier,
    supportsTablet: false,
    infoPlist: {
      NSLocationWhenInUseUsageDescription: '用于选择当前考试地区',
      NSLocationAlwaysUsageDescription: '用于选择当前考试地区',
    },
  },
  android: {
    package: variant.androidPackage,
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      backgroundColor: '#1a56db',
    },
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#ffffff',
        image: './assets/splash.png',
        imageWidth: 200,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    APP_VARIANT,
    API_BASE_URL: variant.apiBaseUrl,
    MAP_BASE_URL: variant.mapBaseUrl,
    WEB_BASE_URL: variant.webBaseUrl,
    WECHAT_APP_ID: variant.wechatAppId,
    CHECK_KEY: '80306f4370b39fd5630ad0529f77adb6',
    UNIVERSAL_LINK_IOS: 'https://fch.i-cbao.com/specialworker/',
    eas: {
      projectId: variant.easProjectId,
    },
  },
})
