import { Request, Response } from 'express'
import Joi from 'joi'
import { Op } from 'sequelize'
import { User } from '../models'
import { generateToken } from '../middleware/auth'
import { generateTokenPair, verifyRefreshToken, refreshAccessToken } from '../utils/tokenManager'
import logger from '../utils/logger'

// 验证规则
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(2).max(50).required(),
  password: Joi.string().min(6).max(100).required(),
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
})

// 注册
export async function register(req: Request, res: Response): Promise<void> {
  try {
    // 验证输入
    const { error, value } = registerSchema.validate(req.body)

    if (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: '输入数据无效',
          details: error.details.map((d) => d.message),
        },
      })
      return
    }

    const { email, username, password } = value

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    })

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          code: 409,
          message: existingUser.email === email ? '该邮箱已被注册' : '用户名已存在',
        },
      })
      return
    }

    // 创建用户
    const user = await User.create({
      email,
      username,
      password,
    })

    // 生成双令牌
    const tokenPair = generateTokenPair(user)

    // 返回用户信息（不含密码）
    res.status(201).json({
      success: true,
      data: {
        token: tokenPair.accessToken,
        refresh_token: tokenPair.refreshToken,
        expires_in: tokenPair.expiresIn,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
        },
      },
      message: '注册成功',
    })
  } catch (error) {
    logger.error('注册错误', { error: error instanceof Error ? error.message : 'Unknown' })
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: '服务器内部错误',
      },
    })
  }
}

// 登录
export async function login(req: Request, res: Response): Promise<void> {
  try {
    // 验证输入
    const { error, value } = loginSchema.validate(req.body)

    if (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: '输入数据无效',
          details: error.details.map((d) => d.message),
        },
      })
      return
    }

    const { email, password } = value

    // 查找用户
    const user = await User.findOne({ where: { email } })

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: '邮箱或密码错误',
        },
      })
      return
    }

    // 验证密码
    const isValidPassword = await user.comparePassword(password)

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: '邮箱或密码错误',
        },
      })
      return
    }

    // 检查账户状态
    if (!user.is_active) {
      res.status(403).json({
        success: false,
        error: {
          code: 403,
          message: '账户已被禁用，请联系管理员',
        },
      })
      return
    }

    // 生成双令牌
    const tokenPair = generateTokenPair(user)

    res.json({
      success: true,
      data: {
        token: tokenPair.accessToken,
        refresh_token: tokenPair.refreshToken,
        expires_in: tokenPair.expiresIn,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
        },
      },
      message: '登录成功',
    })
  } catch (error) {
    logger.error('登录错误', { error: error instanceof Error ? error.message : 'Unknown' })
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: '服务器内部错误',
      },
    })
  }
}

// 刷新令牌
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { error, value } = refreshTokenSchema.validate(req.body)

    if (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: '刷新令牌不能为空',
        },
      })
      return
    }

    const { refreshToken } = value

    // 验证刷新令牌
    const payload = verifyRefreshToken(refreshToken)

    if (!payload) {
      res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: '刷新令牌无效或已过期',
        },
      })
      return
    }

    // 查找用户
    const user = await User.findByPk(payload.userId)

    if (!user || !user.is_active) {
      res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: '用户不存在或已被禁用',
        },
      })
      return
    }

    // 生成新的访问令牌
    const result = refreshAccessToken(refreshToken, user)

    if (!result) {
      res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: '刷新令牌验证失败',
        },
      })
      return
    }

    res.json({
      success: true,
      data: {
        token: result.accessToken,
        expires_in: result.expiresIn,
      },
      message: '令牌刷新成功',
    })
  } catch (error) {
    logger.error('刷新令牌错误', { error: error instanceof Error ? error.message : 'Unknown' })
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: '服务器内部错误',
      },
    })
  }
}

// 获取当前用户信息
export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as unknown as { user: { id: string } }).user

    const userData = await User.findByPk(user.id, {
      attributes: ['id', 'email', 'username', 'avatar', 'role', 'createdAt'],
    })

    if (!userData) {
      res.status(404).json({
        success: false,
        error: {
          code: 404,
          message: '用户不存在',
        },
      })
      return
    }

    res.json({
      success: true,
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          avatar: userData.avatar,
          role: userData.role,
          created_at: userData.createdAt,
        },
      },
    })
  } catch (error) {
    logger.error('获取用户信息错误', { error: error instanceof Error ? error.message : 'Unknown' })
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: '服务器内部错误',
      },
    })
  }
}

// 更新用户资料
export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as unknown as { user: { id: string } }).user.id
    const { username, bio, avatar_url } = req.body

    const updateData: Record<string, string> = {}
    if (username) updateData.username = username
    if (bio) updateData.bio = bio
    if (avatar_url) updateData.avatar = avatar_url

    const [updatedCount] = await User.update(updateData, {
      where: { id: userId },
    })

    if (updatedCount === 0) {
      res.status(404).json({
        success: false,
        error: {
          code: 404,
          message: '用户不存在',
        },
      })
      return
    }

    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'email', 'username', 'avatar', 'role', 'createdAt'],
    })

    res.json({
      success: true,
      data: {
        user: {
          id: updatedUser!.id,
          email: updatedUser!.email,
          username: updatedUser!.username,
          avatar: updatedUser!.avatar,
          role: updatedUser!.role,
          created_at: updatedUser!.createdAt,
        },
      },
      message: '更新成功',
    })
  } catch (error) {
    logger.error('更新用户资料错误', { error: error instanceof Error ? error.message : 'Unknown' })
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: '服务器内部错误',
      },
    })
  }
}

// 上传头像
export async function uploadAvatar(_req: Request, res: Response): Promise<void> {
  try {
    // TODO: Implement avatar upload with multer
    // For now, return a placeholder response
    res.json({
      success: true,
      data: {
        avatar_url: 'https://example.com/avatar.jpg',
      },
      message: '头像上传成功',
    })
  } catch (error) {
    logger.error('上传头像错误', { error: error instanceof Error ? error.message : 'Unknown' })
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: '服务器内部错误',
      },
    })
  }
}

// 登出
export async function logout(_req: Request, res: Response): Promise<void> {
  try {
    // In a stateless JWT system, logout is handled client-side
    // Optionally, we can add the token to a blacklist in Redis
    res.json({
      success: true,
      message: '登出成功',
    })
  } catch (error) {
    logger.error('登出错误', { error: error instanceof Error ? error.message : 'Unknown' })
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: '服务器内部错误',
      },
    })
  }
}

// 修改密码
export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as unknown as { user: { id: string } }).user.id
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: '旧密码和新密码不能为空',
        },
      })
      return
    }

    if (newPassword.length < 6 || newPassword.length > 100) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: '新密码长度必须在6-100位之间',
        },
      })
      return
    }

    const user = await User.findByPk(userId)

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 404,
          message: '用户不存在',
        },
      })
      return
    }

    const isValidPassword = await user.comparePassword(oldPassword)

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: '旧密码错误',
        },
      })
      return
    }

    const hashedPassword = User.hashPassword(newPassword)
    await User.update({ password: hashedPassword }, { where: { id: userId } })

    logger.info('用户修改密码成功', { userId })

    res.json({
      success: true,
      message: '密码修改成功',
    })
  } catch (error) {
    logger.error('修改密码错误', { error: error instanceof Error ? error.message : 'Unknown' })
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: '服务器内部错误',
      },
    })
  }
}

// 登出所有设备
export async function logoutAllDevices(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as unknown as { user: { id: string } }).user.id

    // TODO: Invalidate all refresh tokens for this user in Redis
    logger.info('User logged out from all devices', { userId })

    res.json({
      success: true,
      message: '已从所有设备登出',
    })
  } catch (error) {
    logger.error('登出所有设备错误', { error: error instanceof Error ? error.message : 'Unknown' })
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: '服务器内部错误',
      },
    })
  }
}
