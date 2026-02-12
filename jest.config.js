module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'lib/**/*.ts',
    'utils/**/*.ts',
    'pages/api/**/*.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
};
