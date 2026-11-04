module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // CI 冷环境（Node 20）下 ts-jest getCacheKey 依赖解析的 statSync 链偶发崩溃，
  // 禁用 transform 缓存绕过（backend 全量编译 ~10s，可接受）
  cache: false,
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { diagnostics: { ignoreCodes: [2353, 2339, 2345] }, sourcemap: false }],
  },
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/config/**',
    '!src/migrations/**',
  ],
  coverageThreshold: {
    global: {
      branches: 32,
      functions: 44,
      lines: 45,
      statements: 44,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
