module.exports = require('@symbola/config/eslint')

module.exports.overrides.push({
  files: ['template.ts'],
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
  },
})
