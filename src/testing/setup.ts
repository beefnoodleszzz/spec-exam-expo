/**
 * Vitest global test setup.
 * Mock React Native modules that don't work in Node.js environment.
 */
import { vi } from 'vitest'

// Define React Native global that logger.ts uses
// @ts-expect-error — __DEV__ is a React Native global not typed in Node
globalThis.__DEV__ = true


// Mock expo-constants
vi.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        APP_VARIANT: 'development',
        API_BASE_URL: 'https://ifch.i-cbao.com/ecsmotojk/api/',
        MAP_BASE_URL: 'https://ifch.i-cbao.com/vcomponent/api/',
        WEB_BASE_URL: 'https://fch.i-cbao.com/ecsmotojkweb/',
        WECHAT_APP_ID: 'test-wechat-id',
        CHECK_KEY: '80306f4370b39fd5630ad0529f77adb6',
        UNIVERSAL_LINK_IOS: 'https://fch.i-cbao.com/specialworker/',
      },
    },
  },
}))

// Mock expo-secure-store
vi.mock('expo-secure-store', () => ({
  setItemAsync: vi.fn().mockResolvedValue(undefined),
  getItemAsync: vi.fn().mockResolvedValue(null),
  deleteItemAsync: vi.fn().mockResolvedValue(undefined),
}))

// Mock @react-native-async-storage/async-storage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    setItem: vi.fn().mockResolvedValue(undefined),
    getItem: vi.fn().mockResolvedValue(null),
    removeItem: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
  },
}))

// Mock react-native Platform
vi.mock('react-native', () => ({
  Platform: {
    select: (obj: Record<string, unknown>) => obj.default ?? obj.ios,
    OS: 'ios',
  },
  View: 'View',
  Text: 'Text',
}))

vi.mock('@expo/vector-icons', () => ({
  Ionicons: () => 'Ionicons',
}))
