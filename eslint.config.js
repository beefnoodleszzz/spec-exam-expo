const expoConfig = require('eslint-config-expo/flat')

module.exports = [
  ...expoConfig,
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.expo/**',
      'src/shared/api/generated/**',
      'openapi/**',
      'scripts/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },
  {
    files: ['src/shared/utils/magic-sign.ts', 'src/shared/api/signature/legacy-signature.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-var': 'off',
      'eqeqeq': 'off',
    },
  },
]
