import dotenv from 'dotenv'
dotenv.config()

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value || value.trim() === '') {
    throw new Error(`❌ 环境变量 ${key} 未设置或为空。请在 .env 文件中配置该变量后再启动服务。`)
  }
  return value
}

function requireMinLength(key: string, minLength: number): string {
  const value = requireEnv(key)
  if (value.length < minLength) {
    throw new Error(`❌ 环境变量 ${key} 长度必须至少 ${minLength} 个字符。当前长度: ${value.length}`)
  }
  return value
}

export const JWT_SECRET = requireMinLength('JWT_SECRET', 32)
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export const PORT = parseInt(process.env.PORT || '25101', 10)
export const NODE_ENV = process.env.NODE_ENV || 'development'

// Database
export const DB_HOST = process.env.DB_HOST || 'localhost'
export const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10)
export const DB_NAME = process.env.DB_NAME || 'd_music_99'
export const DB_USER = process.env.DB_USER || 'root'
export const DB_PASSWORD = requireEnv('DB_PASSWORD')
export const DB_POOL_MAX = parseInt(process.env.DB_POOL_MAX || '10', 10)

// Redis (optional)
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
export const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10)

// Upload
export const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10)

// CORS
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:20101'

// Rate Limiting
export const RATE_LIMIT_WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_WINDOW_MS || '900000',
  10 // 15 minutes
)
export const RATE_LIMIT_MAX_REQUESTS = parseInt(
  process.env.RATE_LIMIT_MAX_REQUESTS || '100',
  10
)

// Frontend URL for WebSocket
export const FRONTEND_URL = CORS_ORIGIN
