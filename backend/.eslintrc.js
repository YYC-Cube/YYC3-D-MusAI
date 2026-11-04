module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  extends: ['plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-unsafe-function-type': 'off',
    'no-empty': 'off',
    'no-useless-catch': 'off',
    'no-async-promise-executor': 'off',
  },
  ignorePatterns: ['dist', 'node_modules', 'coverage', '*.js'],
  overrides: [
    {
      // 测试文件：resetModules+require 动态加载与 mock 回调类型属测试惯例
      files: ['src/__tests__/**/*.ts', 'src/**/*.test.ts'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-unsafe-function-type': 'off',
      },
    },
  ],
}
