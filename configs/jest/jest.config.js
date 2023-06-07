/*
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  collectCoverageFrom: ['**/*.ts', '!**/*.spec.ts', '!index.ts'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  coveragePathIgnorePatterns: ['<rootDir>/src/index.ts$'],
  reporters: ['default', 'github-actions'],
  roots: ['<rootDir>/src/'],
  transform: {
    '^.+\\.ts$': 'esbuild-jest',
  },
}
