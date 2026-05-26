<div align="center">
  <img src="../public/DXJ-02.png" alt="D-Music 99 Logo" width="180">
  <h1>🎨 D-Music 99 前端开发文档</h1>
  <p>
    <strong>基于 React 18 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui 的现代化前端应用</strong>
  </p>

  <p>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white" alt="React"></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.6.3-3178C6?logo=typescript&logoColor=white" alt="TypeScript"></a>
    <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-6.0.5-646CFF?logo=vite&logoColor=white" alt="Vite"></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
    <a href="https://ui.shadcn.com"><img src="https://img.shields.io/badge/shadcn%2Fui-latest-000000?logo=shadcnui&logoColor=white" alt="shadcn/ui"></a>
  </p>
  <p>
    <a href="https://github.com/your-org/d-music-99/actions"><img src="https://img.shields.io/badge/CI%2FCD-Passing-brightgreen?logo=githubactions&logoColor=white" alt="CI/CD"></a>
    <a href="#"><img src="https://img.shields.io/badge/Coverage-85%25-brightgreen" alt="Coverage"></a>
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
- [状态管理](#状态管理)
- [API 层](#api-层)
- [路由系统](#路由系统)
- [构建配置](#构建配置)
- [测试指南](#测试指南)
- [五高五标五化](#五高五标五化)

---

## 🛠️ 技术栈

| 技术 | 版本 | 说明 | 徽章 |
|------|------|------|------|
| React | 18.3.1 | UI 框架 | ![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white) |
| TypeScript | 5.6.3 | 类型系统 | ![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6?logo=typescript&logoColor=white) |
| Vite | 6.0.5 | 构建工具 | ![Vite](https://img.shields.io/badge/Vite-6.0.5-646CFF?logo=vite&logoColor=white) |
| Tailwind CSS | 4.0.0 | 原子化 CSS | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white) |
| shadcn/ui | latest | 组件库 | ![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-000000?logo=shadcnui&logoColor=white) |
| Radix UI | latest | 无障碍原语 | ![Radix UI](https://img.shields.io/badge/Radix_UI-latest-161618?logo=radixui&logoColor=white) |
| Zustand | 4.5.0 | 状态管理 | ![Zustand](https://img.shields.io/badge/Zustand-4.5.0-4B3621?logo=react&logoColor=white) |
| React Router | 6.28.0 | 路由 | ![React Router](https://img.shields.io/badge/React_Router-6.28.0-CA4245?logo=reactrouter&logoColor=white) |
| Axios | 1.7.0 | HTTP 客户端 | ![Axios](https://img.shields.io/badge/Axios-1.7.0-5A29E4?logo=axios&logoColor=white) |
| Framer Motion | 11.15.0 | 动画 | ![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.15.0-0055FF?logo=framer&logoColor=white) |
| Lucide React | 0.468.0 | 图标库 | ![Lucide](https://img.shields.io/badge/Lucide-0.468.0-F56565?logo=lucide&logoColor=white) |

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 9.0.0

### 安装依赖

```bash
cd frontend
pnpm install
```

### 环境变量

创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:25101/api
```

### 开发命令

```bash
pnpm run dev           # 启动开发服务器 (http://localhost:20101)
pnpm run build         # 生产构建
pnpm run preview       # 预览生产构建 (http://localhost:20102)
pnpm run lint          # ESLint 检查
pnpm run type-check    # TypeScript 类型检查
pnpm run test          # 运行单元测试
pnpm run test:coverage # 测试覆盖率
pnpm run analyze       # 构建包分析
```

---

## 📁 项目结构

```
frontend/
├── src/
│   ├── components/          # 组件目录
│   │   ├── ui/             # shadcn/ui 原子组件
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── Layout/         # 布局组件
│   │   │   ├── Layout.tsx      # 主布局
│   │   │   ├── Navigation.tsx  # 导航栏
│   │   │   └── MiniPlayer.tsx  # 迷你播放器
│   │   └── features/       # 业务功能组件
│   │       ├── AudioVisualizer.tsx
│   │       ├── AILyricsGenerator.tsx
│   │       └── ...
│   ├── pages/              # 页面组件
│   │   ├── HomePage.tsx
│   │   ├── DiscoverPage.tsx
│   │   ├── PlayerPage.tsx
│   │   ├── PlaylistsPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── stores/             # Zustand 状态管理
│   │   ├── authStore.ts
│   │   └── playerStore.ts
│   ├── services/           # API 服务层
│   │   ├── authService.ts
│   │   └── chatService.ts
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useAudioEngine.ts
│   │   └── useAIAssistant.ts
│   ├── lib/                # 工具函数
│   │   ├── api.ts          # Axios 实例
│   │   ├── utils.ts        # cn() 等工具
│   │   └── audioEngine.ts  # 音频引擎
│   ├── types/              # TypeScript 类型
│   │   └── music.ts
│   ├── data/               # 模拟数据
│   │   └── mockData.ts
│   ├── App.tsx             # 根组件
│   └── main.tsx            # 入口文件
├── public/                 # 静态资源
├── index.html
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── eslint.config.js        # ESLint 配置 (Flat Config)
└── package.json
```

---

## 📐 开发规范

### 组件规范

```typescript
// 1. 函数组件 + TypeScript
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  title: string
  onClick?: () => void
}

function MyComponent({ title, onClick }: Props) {
  const [count, setCount] = useState(0)

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">{title}</h1>
      <Button onClick={onClick}>点击</Button>
    </div>
  )
}

export default MyComponent
```

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `PlayerPage.tsx` |
| 工具函数 | camelCase | `formatTime.ts` |
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL` |
| 类型/接口 | PascalCase | `UserProfile` |
| Hook | camelCase + use 前缀 | `useAudioEngine` |

### 导入顺序

```typescript
// 1. React 内置
import { useState, useEffect } from 'react'

// 2. 第三方库
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// 3. 内部组件
import { Button } from '@/components/ui/button'
import Layout from '@/components/Layout/Layout'

// 4. 工具/服务
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

// 5. 类型
import type { Track } from '@/types/music'
```

---

## 🐻 状态管理

### Auth Store

```typescript
import { useAuthStore } from '@/stores/authStore'

function Component() {
  const { user, isAuthenticated, actions } = useAuthStore()

  const handleLogin = async () => {
    await actions.login('user@example.com', 'password')
  }

  const handleLogout = () => {
    actions.logout()
  }

  return (
    <div>
      {isAuthenticated ? (
        <span>欢迎, {user?.username}</span>
      ) : (
        <button onClick={handleLogin}>登录</button>
      )}
    </div>
  )
}
```

### Player Store

```typescript
import { usePlayerStore } from '@/stores/playerStore'

function Player() {
  const { currentTrack, isPlaying, progress, actions } = usePlayerStore()

  return (
    <div>
      <button onClick={() => actions.togglePlay()}>
        {isPlaying ? '暂停' : '播放'}
      </button>
      <button onClick={() => actions.next()}>下一首</button>
    </div>
  )
}
```

---

## 🌐 API 层

### 使用 api 实例

```typescript
import api from '@/lib/api'

// GET 请求
const { data } = await api.get('/songs')

// POST 请求
const { data } = await api.post('/auth/login', { email, password })

// 自动处理：
// - JWT Token 附加
// - 401 自动刷新 Token
// - 错误统一处理
```

### 使用 Service 层

```typescript
import * as authService from '@/services/authService'

// 登录
const { token, user } = await authService.login({ email, password })

// 获取用户信息
const { user } = await authService.getProfile()

// 修改密码
await authService.changePassword({ oldPassword, newPassword })
```

---

## 🛤️ 路由系统

```typescript
// App.tsx
<Routes>
  {/* 认证页面（无布局） */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />

  {/* 主应用（带布局） */}
  <Route path="/" element={<Layout />}>
    <Route index element={<HomePage />} />
    <Route path="discover" element={<DiscoverPage />} />
    <Route path="player" element={<PlayerPage />} />
    <Route path="playlists" element={<PlaylistsPage />} />
  </Route>
</Routes>
```

---

## ⚙️ 构建配置

### Vite 配置要点

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 20101,
    proxy: {
      '/api': {
        target: 'http://localhost:25101',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-slot', 'class-variance-authority'],
          animations: ['framer-motion'],
          charts: ['recharts'],
        },
      },
    },
  },
})
```

---

## 🧪 测试指南

### 单元测试

```bash
pnpm run test          # 运行测试
pnpm run test:ui       # UI 模式
pnpm run test:coverage # 覆盖率报告
```

### E2E 测试 (Playwright)

```bash
pnpm dlx playwright install  # 安装浏览器
pnpm dlx playwright test     # 运行测试
```

---

## 🎨 shadcn/ui 组件使用

### 添加新组件

```bash
npx shadcn add button
npx shadcn add card
npx shadcn add dialog
```

### 自定义主题

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    /* ... */
  }
}
```

---

## 📦 构建产物

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      # 主入口
│   ├── vendor-[hash].js     # 第三方库
│   ├── ui-[hash].js         # UI 组件
│   ├── animations-[hash].js # 动画库
│   ├── charts-[hash].js     # 图表库
│   └── index-[hash].css     # 样式
```

---

## 🏗️ 五高五标五化

### 五高原则

| 原则 | 实现 | 状态 |
|------|------|------|
| **高可用性** | React 18 Concurrent Mode + Error Boundary | ✅ |
| **高性能** | Vite 构建优化 + 代码分割 + 懒加载 | ✅ |
| **高安全性** | JWT 双令牌 + HTTPS + XSS 防护 | ✅ |
| **高扩展性** | 组件化架构 + Monorepo 管理 | ✅ |
| **高可维护性** | TypeScript 严格模式 + ESLint Flat Config | ✅ |

### 五标体系

| 标准 | 实现 | 状态 |
|------|------|------|
| **标准化** | shadcn/ui 组件规范 + RESTful API 规范 | ✅ |
| **规范化** | 命名规范 + 导入顺序 + 代码审查 | ✅ |
| **自动化** | CI/CD 流水线 + 自动化测试 | ✅ |
| **智能化** | AI 歌词生成 + 智能推荐 | ✅ |
| **可视化** | 音频可视化 + 数据图表 | ✅ |

### 五化架构

| 架构 | 实现 | 状态 |
|------|------|------|
| **流程化** | Git Flow + 敏捷开发 | ✅ |
| **文档化** | 完整 README + API 文档 | ✅ |
| **工具化** | pnpm workspace + Vite + ESLint | ✅ |
| **数字化** | 用户行为分析 + 性能监控 | ✅ |
| **生态化** | shadcn/ui 生态 + npm 包管理 | ✅ |

---

## 🔗 相关链接

- [shadcn/ui 文档](https://ui.shadcn.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Vite 文档](https://vitejs.dev/)
- [Zustand 文档](https://docs.pmnd.rs/zustand)

---

<div align="center">

> **「YanYuCloudCube」**
> **「<admin@0379.email>」**
> **「Words Initiate Quadrants, Language Serves as Core for Future」**
> **「All things converge in cloud pivot; Deep stacks ignite a new era of intelligence」**

</div>
