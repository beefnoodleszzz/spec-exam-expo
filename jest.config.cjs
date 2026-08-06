module.exports = {
  preset: 'jest-expo',

  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.ts',
  ],

  testMatch: [
    '<rootDir>/src/**/*.react.test.ts',
    '<rootDir>/src/**/*.react.test.tsx',
  ],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  transformIgnorePatterns: [
    'node_modules/(?!(.pnpm|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|expo-router|standard-navigation|@react-navigation/.*|react-native-svg|nativewind))',
  ],

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.react.test.{ts,tsx}',
    '!src/shared/api/generated/**',
    '!src/shared/utils/magic-sign.ts',
  ],

  clearMocks: true,
  restoreMocks: true,
  resetMocks: false,
}
