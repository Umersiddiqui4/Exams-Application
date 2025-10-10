import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // TypeScript any type warnings
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'off', // Too strict for gradual migration
      '@typescript-eslint/no-unsafe-member-access': 'off', // Too strict for gradual migration
      '@typescript-eslint/no-unsafe-call': 'off', // Too strict for gradual migration
      '@typescript-eslint/no-unsafe-return': 'off', // Too strict for gradual migration
      // Console usage warnings (allow in logger.ts)
      'no-console': 'off', // Disabled since we use logger utility which uses console internally
      // Error handling warnings
      'no-empty': ['warn', { allowEmptyCatch: false }], // Warn on empty blocks including catch
      // Unused vars (allow in some cases)
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      // TS comment directives
      '@typescript-eslint/ban-ts-comment': ['error', {
        'ts-ignore': 'allow-with-description',
        'ts-expect-error': 'allow-with-description'
      }],
    },
  },
)
