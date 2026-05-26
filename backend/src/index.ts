import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Express, NextFunction, Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { createServer } from 'http'
import path from 'path'
import { Server as SocketIOServer } from 'socket.io'
import { FRONTEND_URL, NODE_ENV, PORT, UPLOAD_DIR } from './config'
import ChatService from './services/chatService'
import logger from './utils/logger'

// 导入路由
import authRoutes from './routes/authRoutes'
import songRoutes from './routes/songRoutes'

// 创建Express应用
const app: Express = express()

// 中间件配置
app.use(helmet())
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}))
app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 静态文件服务（上传的文件）
app.use('/api/files', express.static(path.join(UPLOAD_DIR)))

// API限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: '请求过于频繁，请稍后再试' },
})
app.use('/api', limiter)

// API路由
app.use('/api/auth', authRoutes)
app.use('/api/songs', songRoutes)

// 健康检查
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'D-Music Backend',
    version: '1.0.0',
    environment: NODE_ENV,
  })
})

// 404处理
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 404,
      message: '接口不存在',
    },
  })
})

// 全局错误处理
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('服务器错误', { error: err.message, stack: err.stack })
  res.status(500).json({
    success: false,
    error: {
      code: 500,
      message: NODE_ENV === 'production' ? '服务器内部错误' : err.message,
    },
  })
})

async function startServer() {
  try {
    // 同步数据库（开发环境）
    if (NODE_ENV !== 'production') {
      const { syncDatabase } = await import('./models')
      await syncDatabase(false) // 不强制重建表
    }

    // 创建HTTP服务器并集成Socket.IO
    const httpServer = createServer(app)
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: FRONTEND_URL,
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    })

    // 初始化聊天服务
    const chatService = new ChatService(io)

    httpServer.listen(PORT, () => {
      logger.info('🚀 D-Music 后端服务启动成功', {
        port: PORT,
        environment: NODE_ENV,
        healthCheck: `http://localhost:${PORT}/api/health`,
        websocket: true,
      })
    })
  } catch (error) {
    logger.error('❌ 服务器启动失败', { error: error instanceof Error ? error.message : String(error) })
    process.exit(1)
  }
}

startServer()

export default app
