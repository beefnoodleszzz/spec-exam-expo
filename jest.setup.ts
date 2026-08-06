/* eslint-disable */
jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn(),
  preventAutoHideAsync: jest.fn(),
}))

jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    setItem: jest.fn().mockResolvedValue(undefined),
    getItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  },
}))

jest.mock('expo-image', () => {
  return {
    Image: 'Image',
  }
})

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: () => {},
    replace: () => {},
    back: () => {},
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
}))
