import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config'
import { User } from '../models'
import logger from '../utils/logger'

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET 必须配置且长度至少32个字符')
}

export interface JwtPayload {
  userId: string
  email: string
  role: 'user' | 'admin'
}

/**
 * Generate a JWT token for a user
 * @deprecated Use generateTokenPair from tokenManager instead for dual token mechanism
 */
export function generateToken(user: User): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch (error) {
    return null
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    let token: string | undefined

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    } else if (req.cookies?.access_token) {
      token = req.cookies.access_token
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: '未提供认证令牌',
        },
      })
    }

    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: '令牌无效或已过期',
        },
      })
    }

    const user = await User.findByPk(decoded.userId)

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: '用户不存在或已被禁用',
        },
      })
    }

    // 将用户信息附加到请求对象
    ; (req as unknown as { user: Record<string, unknown> }).user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
    }

    next()
  } catch (error) {
    logger.error('Auth middleware error', { error: error instanceof Error ? error.message : 'Unknown' })
    return res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: '服务器内部错误',
      },
    })
  }
}

export async function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)

      if (decoded) {
        const user = await User.findByPk(decoded.userId)
        if (user && user.is_active) {
          ; (req as unknown as { user: Record<string, unknown> }).user = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            avatar: user.avatar,
          }
        }
      }
    }

    next()
  } catch (_error) {
    next()
  }
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = (req as unknown as { user?: { role?: string } }).user

  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 403,
        message: '需要管理员权限',
      },
    })
  }

  next()
}
