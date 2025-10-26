const eslint = require('@eslint/js')
const tseslint = require('typescript-eslint')
const prettier = require('eslint-config-prettier')
const jestPlugin = require('eslint-plugin-jest')
const jestFormattingPlugin = require('eslint-plugin-jest-formatting')
const tsdocPlugin = require('eslint-plugin-tsdoc')
const globals = require('globals')

module.exports = tseslint.config(
  // Base recommended configs
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // JavaScript/Config files
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // TypeScript files
  {
    files: ['**/*.ts', '!**/*.spec.ts'],
    plugins: {
      tsdoc: tsdocPlugin,
    },
    rules: {
      'tsdoc/syntax': 'warn',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  },

  // Test files
  {
    files: ['**/*.spec.ts'],
    plugins: {
      jest: jestPlugin,
      'jest-formatting': jestFormattingPlugin,
    },
    languageOptions: {
      globals: {
        ...jestPlugin.environments.globals.globals,
      },
    },
    settings: {
      jest: {
        version: '30',
      },
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      ...jestFormattingPlugin.configs.strict.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // Prettier (must be last to override formatting rules)
  prettier,

  // Global ignores
  {
    ignores: ['coverage/**', 'dist/**', 'docs/**', 'node_modules/**'],
  },
)
