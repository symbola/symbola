module.exports = {
  root: true,
  overrides: [
    {
      files: ['src/**/*.ts'],
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
      plugins: ['eslint-plugin-tsdoc'],
      rules: {
        'tsdoc/syntax': 'warn',
        '@typescript-eslint/no-empty-interface': 'off',
      },
    },
    {
      files: ['src/**/*.spec.ts'],
      extends: ['plugin:jest/recommended', 'plugin:jest-formatting/strict'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
  ignorePatterns: ['coverage', 'dist', 'docs'],
}
