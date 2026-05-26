import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
      ],
      thresholds: {
        branches: 50,
        functions: 35,
        lines: 60,
        statements: 60,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@components': path.resolve(import.meta.dirname, './src/components'),
      '@stores': path.resolve(import.meta.dirname, './src/stores'),
      '@services': path.resolve(import.meta.dirname, './src/services'),
      '@lib': path.resolve(import.meta.dirname, './src/lib'),
      '@hooks': path.resolve(import.meta.dirname, './src/hooks'),
      '@pages': path.resolve(import.meta.dirname, './src/pages'),
      '@types': path.resolve(import.meta.dirname, './src/types'),
      '@data': path.resolve(import.meta.dirname, './src/data'),
    },
  },
})
