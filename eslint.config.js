import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  {
    ignores: ['dist', 'node_modules', 'api/vendor', 'public', 'api/public', 'api/resources'],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: { ecmaVersion: 2020, sourceType: 'module' },
    ...js.configs.recommended,
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2020, sourceType: 'module', parser: tsParser },
    plugins: { '@typescript-eslint': tsPlugin, react: react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      // Basic TypeScript/React-friendly rules — expand as needed
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
]
