import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config'
import logger from './logger'

export interface TokenPayload {
  userId: string
  email: string
  role: 'user' | 'admin'
  type: 'access' | 'refresh'
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// Token expiration times
const ACCESS_TOKEN_EXPIRES_IN = '15m' // Short-lived access token
const REFRESH_TOKEN_EXPIRES_IN = '7d' // Long-lived refresh token

/**
 * Generate a token pair (access token + refresh token)
 */
export function generateTokenPair(user: {
  id: string
  email: string
  role: 'user' | 'admin'
}): TokenPair {
  const accessPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    type: 'access',
  }

  const refreshPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    type: 'refresh',
  }

  const accessToken = jwt.sign(accessPayload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  })

  const refreshToken = jwt.sign(refreshPayload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  })

  // Calculate expiration time in seconds (15 minutes)
  const expiresIn = 15 * 60

  logger.debug('Token pair generated', { userId: user.id })

  return {
    accessToken,
    refreshToken,
    expiresIn,
  }
}

/**
 * Verify and decode a token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    logger.debug('Token verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return null
  }
}

/**
 * Verify access token specifically
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  const payload = verifyToken(token)

  if (!payload || payload.type !== 'access') {
    return null
  }

  return payload
}

/**
 * Verify refresh token specifically
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  const payload = verifyToken(token)

  if (!payload || payload.type !== 'refresh') {
    return null
  }

  return payload
}

/**
 * Refresh an access token using a refresh token
 */
export function refreshAccessToken(
  refreshToken: string,
  user: { id: string; email: string; role: 'user' | 'admin' }
): { accessToken: string; expiresIn: number } | null {
  const payload = verifyRefreshToken(refreshToken)

  if (!payload) {
    logger.warn('Invalid refresh token used', { userId: user.id })
    return null
  }

  // Ensure the refresh token belongs to the same user
  if (payload.userId !== user.id) {
    logger.warn('Refresh token user mismatch', {
      tokenUserId: payload.userId,
      requestUserId: user.id,
    })
    return null
  }

  // Generate new access token
  const accessPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    type: 'access',
  }

  const accessToken = jwt.sign(accessPayload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  })

  const expiresIn = 15 * 60 // 15 minutes

  logger.debug('Access token refreshed', { userId: user.id })

  return {
    accessToken,
    expiresIn,
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload
  } catch (error) {
    return null
  }
}
