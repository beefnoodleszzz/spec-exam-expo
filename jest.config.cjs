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

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.react.test.{ts,tsx}',
    '!src/shared/api/generated/**',
    '!src/shared/utils/magic-sign.ts',
  ],

  clearMocks: false,
  restoreMocks: false,
  resetMocks: false,
}
