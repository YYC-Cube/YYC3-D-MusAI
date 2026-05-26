module.exports = {
  testEnvironment: 'node',
  testRegex: '\\/e2e\\/.+\\.test\\.js$',
  setupFiles: ['./e2e/init.js'],
  testTimeout: 120000,
  transform: {},
  verbose: true
}
