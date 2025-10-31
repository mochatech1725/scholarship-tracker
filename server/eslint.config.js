import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.node,
        process: 'readonly',
      },
    },
    rules: {
      // Unused variable and function warnings
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-unused-vars': 'off', // Turn off base rule as it conflicts with TypeScript version

      // Additional code quality rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off', // Can be too strict
      '@typescript-eslint/no-empty-function': 'warn',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js'],
  }
)

