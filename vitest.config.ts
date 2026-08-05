import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/testing/setup.ts'],
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'scripts/openapi/**/*.test.ts',
    ],
    exclude: [
      'src/**/*.react.test.ts',
      'src/**/*.react.test.tsx',
      'node_modules',
      '.expo',
    ],
    server: {
      deps: {
        inline: ['@testing-library/react-native', 'react-native'],
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
