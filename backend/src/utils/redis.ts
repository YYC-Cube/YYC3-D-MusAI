import Redis from 'ioredis'
import type { Request, Response, NextFunction } from 'express'
import { REDIS_HOST, REDIS_PORT } from '../config'
import logger from './logger'

// Create Redis client instance
const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  maxRetriesPerRequest: 3,
})

redis.on('connect', () => {
  logger.info('Redis connected', { host: REDIS_HOST, port: REDIS_PORT })
})

redis.on('error', (error: Error) => {
  logger.error('Redis error', { error: error.message })
})

redis.on('reconnecting', () => {
  logger.warn('Redis reconnecting...')
})

export default redis

/**
 * Cache utility functions
 */
export const cache = {
  /**
   * Get cached data by key
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key)
      if (!data) return null
      return JSON.parse(data) as T
    } catch (error) {
      logger.error('Cache get error', { key, error: error instanceof Error ? error.message : 'Unknown' })
      return null
    }
  },

  /**
   * Set cache data with optional expiration (in seconds)
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      if (ttl) {
        await redis.setex(key, ttl, serialized)
      } else {
        await redis.set(key, serialized)
      }
    } catch (error) {
      logger.error('Cache set error', { key, error: error instanceof Error ? error.message : 'Unknown' })
    }
  },

  /**
   * Delete cached data by key
   */
  async del(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      logger.error('Cache del error', { key, error: error instanceof Error ? error.message : 'Unknown' })
    }
  },

  /**
   * Delete cached data by pattern
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      logger.error('Cache delPattern error', { pattern, error: error instanceof Error ? error.message : 'Unknown' })
    }
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      logger.error('Cache exists error', { key, error: error instanceof Error ? error.message : 'Unknown' })
      return false
    }
  },

  /**
   * Get TTL of a key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key)
    } catch (error) {
      logger.error('Cache ttl error', { key, error: error instanceof Error ? error.message : 'Unknown' })
      return -1
    }
  },
}

/**
 * Cache middleware for Express routes
 */
export function cacheMiddleware(ttl: number = 300) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.method}:${req.originalUrl}`

    try {
      const cached = await cache.get<unknown>(key)

      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true,
        })
      }

      // Override res.json to cache the response
      const originalJson = res.json.bind(res)
      res.json = function(body: unknown) {
        if (body && typeof body === 'object' && 'success' in body && body.success === true) {
          cache.set(key, (body as { data?: unknown }).data, ttl).catch(() => {})
        }
        return originalJson(body)
      }

      next()
    } catch (error) {
      next()
    }
  }
}
