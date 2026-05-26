import { Request, Response } from 'express'
import Joi from 'joi'
import { Op } from 'sequelize'
import { Song, User } from '../models'
import logger from '../utils/logger'
import { cache } from '../utils/redis'

// 验证规则
const createSongSchema = Joi.object({
  title: Joi.string().max(200).required(),
  artist: Joi.string().max(150).required(),
  album_id: Joi.string().uuid().optional(),
  duration: Joi.number().integer().positive().optional(),
  genre: Joi.string().max(50).optional(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
  youtube_id: Joi.string().max(50).optional(),
  is_public: Joi.boolean().default(true),
})

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    username: string
    role: string
    avatar?: string
  }
}

// 获取所有歌曲（支持分页、搜索、筛选）
export async function getAllSongs(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const offset = (page - 1) * limit

    const { search, genre, artist, sort_by = 'createdAt', order = 'DESC' } = req.query

    const whereClause: Record<string, unknown> = {}

    // 搜索功能
    if (search) {
      whereClause[Op.or as unknown as string] = [
        { title: { [Op.like]: `%${search}%` } },
        { artist: { [Op.like]: `%${search}%` } },
        { genre: { [Op.like]: `%${search}%` } },
      ]
    }

    // 筛选条件
    if (genre) whereClause.genre = genre
    if (artist) whereClause.artist = { [Op.like]: `%${artist}%` }

    // 排序字段白名单
    const allowedSortFields = ['createdAt', 'play_count', 'like_count', 'title', 'artist', 'year']
    const sortField = allowedSortFields.includes(sort_by as string) ? sort_by : 'createdAt'
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC'

    const { count, rows: songs } = await Song.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [[sortField as string, sortOrder]],
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'username', 'avatar'],
        },
      ],
    })

    res.json({
      success: true,
      data: {
        songs,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
    })
  } catch (error) {
    logger.error('获取歌曲列表错误', { error: error instanceof Error ? error.message : 'Unknown' })
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: '服务器内部错误',
      },
    })
  }
}

// 获取单首歌曲详情
export async function getSongById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params

    const song = await Song.findByPk(id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'username', 'avatar'],
        },
      ],
    })

    if (!song) {
      res.status(404).json({
        success: false,
        error: {
          code: 404,
          message: '歌曲不存在',
        },
      })
      return
    }

    // 增加播放次数
    await song.increment('play_count')

    // 清除相关缓存
    await cache.delPattern(`cache:GET:/api/songs*`)

    res.json({
      success: true,
      data: { song },
    })
  } catch (error) {
    logger.error('获取歌曲详情错误', { error: error instanceof Error ? error.message : 'Unknown' })
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: '服务器内部错误',
      },
    })
  }
}

// 创建歌曲（上传）
export async function createSong(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: '未认证',
        },
      })
      return
    }

    // 验证输入
    const { error, value } = createSongSchema.validate(req.body)

    if (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: '输入数据无效',
          details: error.details.map((d: Joi.ValidationErrorItem) => d.message),
        },
      })
      return
    }

    // 检查是否有上传的文件
    if (!req.files && !value.youtube_id) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: '请上传音频文件或提供YouTube ID',
        },
      })
      return
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined

    // 构建歌曲数据
    const songData = {
      ...value,
      uploaded_by: userId,
      audio_url: files?.audio?.[0]?.path?.replace(/\\/g, '/'),
      cover_url: files?.cover?.[0]?.path?.replace(/\\/g, '/'),
    }

    const song = await Song.create(songData)

    // 清除歌曲列表缓存
    await cache.delPattern(`cache:GET:/api/songs*`)

    res.status(201).json({
      success: true,
      data: { song },
      message: '歌曲上传成功',
    })
  } catch (error) {
    logger.error('创建歌曲错误', { error: error instanceof Error ? error.message : 'Unknown' })
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: '服务器内部错误',
      },
    })
  }
}

// 更新歌曲信息
export async function updateSong(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id
    const userRole = req.user?.role
    const { id } = req.params

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: '未认证',
        },
      })
      return
    }

    const song = await Song.findByPk(id)

    if (!song) {
      res.status(404).json({
        success: false,
        error: {
          code: 404,
          message: '歌曲不存在',
        },
      })
      return
    }

    // 权限检查：只有上传者或管理员可以编辑
    if (song.uploaded_by !== userId && userRole !== 'admin') {
      res.status(403).json({
        success: false,
        error: {
          code: 403,
          message: '没有权限编辑此歌曲',
        },
      })
      return
    }

    // 更新允许的字段
    const allowedFields = ['title', 'artist', 'genre', 'year', 'youtube_id', 'is_public']
    const updateData: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field]
      }
    }

    // 处理文件更新
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined
    if (files?.audio?.[0]) {
      updateData.audio_url = files.audio[0].path.replace(/\\/g, '/')
    }
    if (files?.cover?.[0]) {
      updateData.cover_url = files.cover[0].path.replace(/\\/g, '/')
    }

    await song.update(updateData)

    // 清除相关缓存
    await cache.del(`cache:GET:/api/songs/${id}`)
    await cache.delPattern(`cache:GET:/api/songs*`)

    res.json({
      success: true,
      data: { song },
      message: '更新成功',
    })
  } catch (error) {
    logger.error('更新歌曲错误', { error: error instanceof Error ? error.message : 'Unknown' })
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: '服务器内部错误',
      },
    })
  }
}

// 删除歌曲
export async function deleteSong(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id
    const userRole = req.user?.role
    const { id } = req.params

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: '未认证',
        },
      })
      return
    }

    const song = await Song.findByPk(id)

    if (!song) {
      res.status(404).json({
        success: false,
        error: {
          code: 404,
          message: '歌曲不存在',
        },
      })
      return
    }

    // 权限检查
    if (song.uploaded_by !== userId && userRole !== 'admin') {
      res.status(403).json({
        success: false,
        error: {
          code: 403,
          message: '没有权限删除此歌曲',
        },
      })
      return
    }

    await song.destroy()

    // 清除相关缓存
    await cache.del(`cache:GET:/api/songs/${id}`)
    await cache.delPattern(`cache:GET:/api/songs*`)

    res.json({
      success: true,
      message: '删除成功',
    })
  } catch (error) {
    logger.error('删除歌曲错误', { error: error instanceof Error ? error.message : 'Unknown' })
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: '服务器内部错误',
      },
    })
  }
}

// 点赞/取消点赞歌曲
export async function toggleLikeSong(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 401,
          message: '未认证',
        },
      })
      return
    }

    const song = await Song.findByPk(id)

    if (!song) {
      res.status(404).json({
        success: false,
        error: {
          code: 404,
          message: '歌曲不存在',
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

    // 使用类型断言访问动态关联方法
    const userWithLikes = user as unknown as {
      hasLikedSongs: (song: Song) => Promise<boolean>
      removeLikedSongs: (song: Song) => Promise<void>
      addLikedSongs: (song: Song) => Promise<void>
    }

    // 检查是否已点赞
    const isLiked = await userWithLikes.hasLikedSongs(song)

    if (isLiked) {
      // 取消点赞
      await userWithLikes.removeLikedSongs(song)
      await song.decrement('like_count')

      res.json({
        success: true,
        data: { liked: false },
        message: '已取消点赞',
      })
    } else {
      // 点赞
      await userWithLikes.addLikedSongs(song)
      await song.increment('like_count')

      res.json({
        success: true,
        data: { liked: true },
        message: '点赞成功',
      })
    }
  } catch (error) {
    logger.error('点赞操作错误', { error: error instanceof Error ? error.message : 'Unknown' })
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: '服务器内部错误',
      },
    })
  }
}

// 获取热门歌曲
export async function getHotSongs(_req: Request, res: Response): Promise<void> {
  try {
    const songs = await Song.findAll({
      where: { is_public: true },
      limit: 20,
      order: [['play_count', 'DESC']],
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'username'],
        },
      ],
    })

    res.json({
      success: true,
      data: { songs },
    })
  } catch (error) {
    logger.error('获取热门歌曲错误', { error: error instanceof Error ? error.message : 'Unknown' })
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: '服务器内部错误',
      },
    })
  }
}
