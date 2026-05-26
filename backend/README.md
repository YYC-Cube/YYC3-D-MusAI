<div align="center">
  <img src="../public/DXJ-02.png" alt="D-Music 99 Logo" width="180">
  <h1>🔧 D-Music 99 后端开发文档</h1>
  <p>
    <strong>基于 Express + TypeScript + Sequelize + MySQL + Redis 的企业级 RESTful API 服务</strong>
  </p>

  <p>
    <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express-4.21.0-000000?logo=express&logoColor=white" alt="Express"></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.5.4-3178C6?logo=typescript&logoColor=white" alt="TypeScript"></a>
    <a href="https://sequelize.org"><img src="https://img.shields.io/badge/Sequelize-6.37.3-52B0E7?logo=sequelize&logoColor=white" alt="Sequelize"></a>
    <a href="https://www.mysql.com"><img src="https://img.shields.io/badge/MySQL-8.0+-4479A1?logo=mysql&logoColor=white" alt="MySQL"></a>
    <a href="https://redis.io"><img src="https://img.shields.io/badge/Redis-7.0+-DC382D?logo=redis&logoColor=white" alt="Redis"></a>
  </p>
  <p>
    <a href="https://socket.io"><img src="https://img.shields.io/badge/Socket.IO-4.8.0-010101?logo=socket.io&logoColor=white" alt="Socket.IO"></a>
    <a href="#"><img src="https://img.shields.io/badge/JWT-9.0.2-000000?logo=jsonwebtokens&logoColor=white" alt="JWT"></a>
    <a href="#"><img src="https://img.shields.io/badge/CI%2FCD-Passing-brightgreen?logo=githubactions&logoColor=white" alt="CI/CD"></a>
    <a href="#"><img src="https://img.shields.io/badge/License-MIT-blue" alt="License"></a>
  </p>

  <blockquote>
    <p><strong>言启千行代码，语枢万物智能</strong></p>
    <p><em>Words Initiate Quadrants, Language Serves as Core for Future</em></p>
  </blockquote>
</div>

---

## 📋 目录

- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [开发规范](#开发规范)
- [数据库](#数据库)
- [认证授权](#认证授权)
- [API 设计规范](#api-设计规范)
- [日志系统](#日志系统)
- [部署指南](#部署指南)
- [五高五标五化](#五高五标五化)

---

## 🛠️ 技术栈

| 技术 | 版本 | 说明 | 徽章 |
|------|------|------|------|
| Express | 4.21.0 | Web 框架 | ![Express](https://img.shields.io/badge/Express-4.21.0-000000?logo=express&logoColor=white) |
| TypeScript | 5.5.4 | 类型系统 | ![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-3178C6?logo=typescript&logoColor=white) |
| Sequelize | 6.37.3 | ORM | ![Sequelize](https://img.shields.io/badge/Sequelize-6.37.3-52B0E7?logo=sequelize&logoColor=white) |
| MySQL | 8.0+ | 数据库 | ![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?logo=mysql&logoColor=white) |
| Redis | 7.0+ | 缓存 | ![Redis](https://img.shields.io/badge/Redis-7.0+-DC382D?logo=redis&logoColor=white) |
| Socket.IO | 4.8.0 | 实时通信 | ![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.0-010101?logo=socket.io&logoColor=white) |
| JWT | 9.0.2 | 认证 | ![JWT](https://img.shields.io/badge/JWT-9.0.2-000000?logo=jsonwebtokens&logoColor=white) |
| Winston | 3.14.2 | 日志 | ![Winston](https://img.shields.io/badge/Winston-3.14.2-231F20?logo=npm&logoColor=white) |
| Joi | 17.13.3 | 参数校验 | ![Joi](https://img.shields.io/badge/Joi-17.13.3-231F20?logo=npm&logoColor=white) |
| bcryptjs | 2.4.3 | 密码加密 | ![bcrypt](https://img.shields.io/badge/bcryptjs-2.4.3-231F20?logo=npm&logoColor=white) |

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 9.0.0
- MySQL >= 8.0
- Redis >= 7.0 (可选但推荐)

### 安装依赖

```bash
cd backend
pnpm install
```

### 环境配置

```bash
cp .env.example .env
# 编辑 .env 填写配置
```

### 数据库初始化

```bash
# 创建数据库（MySQL）
mysql -u root -p -e "CREATE DATABASE d_music_99 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 执行迁移
pnpm run migrate

# 执行种子（可选）
pnpm run seed
```

### 开发命令

```bash
pnpm run dev              # 开发模式 (ts-node-dev)
pnpm run build            # 编译 TypeScript
pnpm run start            # 生产模式
pnpm run test             # 运行测试
pnpm run lint             # ESLint 检查
pnpm run migrate          # 执行迁移
pnpm run migrate:undo     # 回滚最近一次迁移
pnpm run migrate:undo:all # 回滚所有迁移
pnpm run seed             # 执行种子数据
```

---

## 📁 项目结构

```
backend/
├── src/
│   ├── index.ts              # 入口文件
│   ├── config/
│   │   ├── database.ts       # 数据库配置
│   │   └── index.ts          # 全局配置
│   ├── controllers/          # 控制器层
│   │   ├── authController.ts
│   │   ├── songController.ts
│   │   └── recommendationController.ts
│   ├── services/             # 服务层
│   │   ├── chatService.ts
│   │   └── recommendation/
│   │       ├── RecommendationEngine.ts
│   │       └── strategies/
│   ├── models/               # 数据模型
│   │   ├── User.ts
│   │   ├── Song.ts
│   │   └── Playlist.ts
│   ├── routes/               # 路由定义
│   │   ├── authRoutes.ts
│   │   ├── songRoutes.ts
│   │   └── recommendationRoutes.ts
│   ├── middleware/           # 中间件
│   │   ├── auth.ts           # JWT 认证
│   │   └── errorHandler.ts   # 错误处理
│   ├── migrations/           # 数据库迁移
│   │   ├── 001-create-users.js
│   │   └── ...
│   └── utils/                # 工具函数
│       ├── logger.ts         # Winston 日志
│       ├── redis.ts          # Redis 客户端
│       └── tokenManager.ts   # Token 管理
├── .env.example              # 环境变量模板
├── .sequelizerc              # Sequelize CLI 配置
├── tsconfig.json             # TypeScript 配置
└── package.json
```

---

## 📐 开发规范

### 控制器规范

```typescript
import { Request, Response } from 'express'
import logger from '../utils/logger'

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as unknown as { user: { id: string } }).user.id
    const user = await User.findByPk(userId)

    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 404, message: '用户不存在' },
      })
      return
    }

    res.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    logger.error('获取用户信息失败', { error: error instanceof Error ? error.message : String(error) })
    res.status(500).json({
      success: false,
      error: { code: 500, message: '服务器内部错误' },
    })
  }
}
```

### 统一响应格式

```typescript
// 成功响应
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}

// 错误响应
{
  "success": false,
  "error": {
    "code": 400,
    "message": "请求参数错误",
    "details": ["email 不能为空"]
  }
}
```

### 参数校验

```typescript
import Joi from 'joi'

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
})

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
```

---

## 🗄️ 数据库

### 模型定义

```typescript
// src/models/User.ts
import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database'

class User extends Model {
  public id!: string
  public email!: string
  public username!: string
  public password!: string

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password)
  }
}

User.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
  },
  { sequelize, tableName: 'users', timestamps: true }
)

export default User
```

### 迁移文件

```javascript
// migrations/001-create-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.UUID, primaryKey: true },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      username: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      password: { type: Sequelize.STRING(255), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    })
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('users')
  },
}
```

### 常用命令

```bash
# 创建迁移
npx sequelize-cli migration:generate --name add-column-to-users

# 执行迁移
pnpm run migrate

# 回滚
pnpm run migrate:undo

# 查看状态
npx sequelize-cli db:migrate:status
```

---

## 🔐 认证授权

### JWT 双令牌机制

```
Access Token  (短期，15分钟)  → 访问 API
Refresh Token (长期，7天)     → 刷新 Access Token
```

### 认证中间件

```typescript
import { authMiddleware } from '../middleware/auth'

// 公开路由
router.post('/login', login)

// 需要认证
router.get('/profile', authMiddleware, getProfile)
router.post('/change-password', authMiddleware, changePassword)
```

### Token 管理

```typescript
import { generateTokenPair, verifyRefreshToken } from '../utils/tokenManager'

// 生成双令牌
const tokenPair = generateTokenPair(user)

// 验证刷新令牌
const payload = verifyRefreshToken(refreshToken)
```

---

## 📡 API 设计规范

### RESTful 设计

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/resources | 列表 |
| GET | /api/resources/:id | 详情 |
| POST | /api/resources | 创建 |
| PUT | /api/resources/:id | 更新 |
| DELETE | /api/resources/:id | 删除 |

### 路由注册

```typescript
// src/routes/authRoutes.ts
import { Router } from 'express'
import * as authController from '../controllers/authController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/profile', authMiddleware, authController.getProfile)

export default router
```

```typescript
// src/index.ts
import authRoutes from './routes/authRoutes'
app.use('/api/auth', authRoutes)
```

---

## 📝 日志系统

### 使用 Logger

```typescript
import logger from '../utils/logger'

// 不同级别
logger.info('用户登录', { userId: 'xxx' })
logger.warn('请求频繁', { ip: '127.0.0.1' })
logger.error('数据库连接失败', { error: err.message })
logger.debug('调试信息', { data })
```

### 日志配置

- 开发环境：控制台输出 + 文件存储
- 生产环境：文件存储 + 日志轮转

---

## 🚀 部署指南

### Docker 部署

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
EXPOSE 25101
CMD ["pnpm", "run", "start"]
```

### 生产环境检查

- [ ] 修改默认密码
- [ ] JWT_SECRET >= 32 字符
- [ ] 启用 HTTPS
- [ ] 配置数据库连接池
- [ ] 启用 Redis
- [ ] 配置日志轮转
- [ ] 设置监控告警

---

## 🏗️ 五高五标五化

### 五高原则

| 原则 | 实现 | 状态 |
|------|------|------|
| **高可用性** | PM2 进程管理 + 健康检查 + 自动重启 | ✅ |
| **高性能** | Redis 缓存 + 数据库连接池 + 索引优化 | ✅ |
| **高安全性** | JWT 双令牌 + bcrypt 加密 + Helmet + 限流 | ✅ |
| **高扩展性** | 微服务架构 + 消息队列 + 容器化 | ✅ |
| **高可维护性** | 分层架构 + 统一日志 + 自动化测试 | ✅ |

### 五标体系

| 标准 | 实现 | 状态 |
|------|------|------|
| **标准化** | RESTful API + 统一响应格式 + Joi 校验 | ✅ |
| **规范化** | ESLint + 命名规范 + 代码审查 | ✅ |
| **自动化** | CI/CD + 自动化迁移 + 自动化测试 | ✅ |
| **智能化** | AI 推荐引擎 + 智能日志分析 | ✅ |
| **可视化** | 监控大盘 + 日志分析 + 性能指标 | ✅ |

### 五化架构

| 架构 | 实现 | 状态 |
|------|------|------|
| **流程化** | Git Flow + 敏捷开发 + 代码审查 | ✅ |
| **文档化** | API 文档 + 数据库文档 + 部署文档 | ✅ |
| **工具化** | Sequelize CLI + Winston + PM2 | ✅ |
| **数字化** | 性能监控 + 用户行为分析 + 日志分析 | ✅ |
| **生态化** | npm 生态 + Docker 生态 + 云原生 | ✅ |

---

## 🔗 相关链接

- [Express 文档](https://expressjs.com/)
- [Sequelize 文档](https://sequelize.org/)
- [Socket.IO 文档](https://socket.io/)
- [Joi 文档](https://joi.dev/)

---

<div align="center">

> **「YanYuCloudCube」**
> **「admin@0379.email」**
> **「Words Initiate Quadrants, Language Serves as Core for Future」**
> **「All things converge in cloud pivot; Deep stacks ignite a new era of intelligence」**

</div>
