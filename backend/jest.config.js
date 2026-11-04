module.exports = {
  testEnvironment: 'node',
  // CI（Node 20 冷环境）下 ts-jest 缓存链存在无法根治的读写崩溃（getCacheKey statSync /
  // .map 写入失败，--no-cache 亦不生效），换用 @swc/jest：仅转译无诊断，类型检查由
  // tsc --noEmit 独立把守（CI lint job 已绿）
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': '@swc/jest',
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
