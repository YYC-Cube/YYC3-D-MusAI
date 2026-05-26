jest.mock('../config', () => ({
  JWT_SECRET: 'this_is_a_test_jwt_secret_key_32chars',
  JWT_EXPIRES_IN: '7d',
  NODE_ENV: 'test',
  PORT: 25101,
  DB_HOST: 'localhost',
  DB_PORT: 3306,
  DB_NAME: 'test',
  DB_USER: 'root',
  DB_PASSWORD: 'test',
  DB_POOL_MAX: 5,
  FRONTEND_URL: 'http://localhost:20101',
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  REDIS_PASSWORD: '',
  UPLOAD_DIR: './uploads',
  MAX_FILE_SIZE: 10485760,
  RATE_LIMIT_WINDOW_MS: 900000,
  RATE_LIMIT_MAX: 100,
}))

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    define: jest.fn(),
    sync: jest.fn(),
    authenticate: jest.fn(),
    query: jest.fn(),
    close: jest.fn(),
    Model: class MockModel {
      static init() { return this }
      static findOne = jest.fn()
      static findAll = jest.fn()
      static findByPk = jest.fn()
      static create = jest.fn()
      static update = jest.fn()
      static destroy = jest.fn()
      static count = jest.fn()
      static belongsTo = jest.fn()
      static hasMany = jest.fn()
      static belongsToMany = jest.fn()
    },
  },
}))
