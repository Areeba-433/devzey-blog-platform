module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
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
