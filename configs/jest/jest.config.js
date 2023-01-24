/*
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  collectCoverageFrom: ['**/*.ts', '!**/*.spec.ts', '!index.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10,
    },
  },
  reporters: ['default', 'github-actions'],
  rootDir: 'src',
  transform: {
    '^.+\\.tsx?$': 'esbuild-jest',
  },
}
