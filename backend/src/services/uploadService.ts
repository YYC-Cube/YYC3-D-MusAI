import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10) // 默认10MB

// 确保上传目录存在
const ensureUploadDir = () => {
  const dirs = [
    path.join(UPLOAD_DIR, 'audio'),
    path.join(UPLOAD_DIR, 'covers'),
    path.join(UPLOAD_DIR, 'avatars'),
  ]

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

ensureUploadDir()

// 存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'others'

    if (file.mimetype.startsWith('audio/')) {
      subfolder = 'audio'
    } else if (file.mimetype.startsWith('image/')) {
      subfolder = 'covers'
    }

    cb(null, path.join(UPLOAD_DIR, subfolder))
  },

  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  },
})

// 文件过滤器
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    // 音频格式
    'audio/mpeg',
    'audio/wav',
    'audio/aac',
    'audio/ogg',
    'audio/mp4',
    'audio/webm',
    // 图片格式
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ]

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}`))
  }
}

// Multer实例
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // 最多同时上传10个文件
  },
})

// 音频文件上传中间件
export const uploadAudio = upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
])

// 头像上传中间件
export const uploadAvatar = upload.single('avatar')

// 错误处理中间件
export function handleUploadError(err: Error, _req: Express.Request, res: any, _next: any) {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: `文件大小超过限制 (${MAX_FILE_SIZE / 1024 / 1024}MB)`,
          },
        })

      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: '上传文件数量超过限制',
          },
        })

      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: '意外的文件字段',
          },
        })

      default:
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: `上传错误: ${err.message}`,
          },
        })
    }
  }

  if (err.message.includes('不支持的文件类型')) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        message: err.message,
      },
    })
  }

  // 其他错误传递给下一个中间件
  _next(err)
}

// 文件访问URL生成器
export function getFileUrl(filePath: string): string {
  const relativePath = filePath.replace(/\\/g, '/').replace(UPLOAD_DIR, '')
  return `/api/files${relativePath}`
}

// 清理旧文件（可选）
export async function cleanupOldFiles(maxAgeDays: number = 30): Promise<number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays)

  let deletedCount = 0

  const cleanDirectory = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) return

    const files = fs.readdirSync(dirPath)

    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const stat = fs.statSync(filePath)

      if (stat.isFile() && stat.mtime < cutoffDate) {
        fs.unlinkSync(filePath)
        deletedCount++
      }
    }
  }

  cleanDirectory(path.join(UPLOAD_DIR, 'audio'))
  cleanDirectory(path.join(UPLOAD_DIR, 'covers'))
  cleanDirectory(path.join(UPLOAD_DIR, 'avatars'))

  return deletedCount
}
