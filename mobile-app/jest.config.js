module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.(ts|tsx|js)', '**/*.(test|spec).(ts|tsx|js)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'react-native-vector-icons/(.*)': '<rootDir>/__mocks__/react-native-vector-icons.js',
    'expo-local-authentication': '<rootDir>/__mocks__/expo-local-authentication.js',
    '@react-native-async-storage/async-storage': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
    'expo-secure-store': '<rootDir>/__mocks__/expo-secure-store.js',
    '@/stores/playerStore': '<rootDir>/__mocks__/@/stores/playerStore.js',
    '@/stores/authStore': '<rootDir>/__mocks__/@/stores/authStore.js',
    '../../stores/playerStore': '<rootDir>/__mocks__/@/stores/playerStore.js',
    '../../stores/authStore': '<rootDir>/__mocks__/@/stores/authStore.js',
    '@/services/userService': '<rootDir>/__mocks__/@/services/userService.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|react-native-vector-icons|expo-local-authentication|expo-modules-core|@react-native-async-storage)/)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/',
  ],
}
