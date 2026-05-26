<div align="center">
  <img src="../public/DXJ-02.png" alt="D-Music 99 Logo" width="180">
  <h1>📱 D-Music 99 移动端开发文档</h1>
  <p>
    <strong>基于 React Native + Expo + TypeScript 的跨平台音乐应用</strong>
  </p>

  <p>
    <a href="https://reactnative.dev"><img src="https://img.shields.io/badge/React_Native-0.73.6-61DAFB?logo=react&logoColor=white" alt="React Native"></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white" alt="React"></a>
    <a href="https://expo.dev"><img src="https://img.shields.io/badge/Expo-50.0.0-000020?logo=expo&logoColor=white" alt="Expo"></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.3.3-3178C6?logo=typescript&logoColor=white" alt="TypeScript"></a>
  </p>
  <p>
    <a href="#"><img src="https://img.shields.io/badge/Zustand-4.5.0-4B3621?logo=react&logoColor=white" alt="Zustand"></a>
    <a href="#"><img src="https://img.shields.io/badge/SecureStore-12.8.1-000020?logo=expo&logoColor=white" alt="SecureStore"></a>
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
- [状态管理](#状态管理)
- [API 层](#api-层)
- [导航路由](#导航路由)
- [安全存储](#安全存储)
- [构建发布](#构建发布)
- [五高五标五化](#五高五标五化)

---

## 🛠️ 技术栈

| 技术 | 版本 | 说明 | 徽章 |
|------|------|------|------|
| React Native | 0.73.6 | 跨平台框架 | ![React Native](https://img.shields.io/badge/React_Native-0.73.6-61DAFB?logo=react&logoColor=white) |
| React | 18.3.1 | UI 框架 | ![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white) |
| Expo | 50.0.0 | 开发工具链 | ![Expo](https://img.shields.io/badge/Expo-50.0.0-000020?logo=expo&logoColor=white) |
| TypeScript | 5.3.3 | 类型系统 | ![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?logo=typescript&logoColor=white) |
| Zustand | 4.5.0 | 状态管理 | ![Zustand](https://img.shields.io/badge/Zustand-4.5.0-4B3621?logo=react&logoColor=white) |
| React Navigation | 6.x | 路由导航 | ![React Navigation](https://img.shields.io/badge/React_Navigation-6.x-6B52AE?logo=reactnavigation&logoColor=white) |
| Axios | 1.7.0 | HTTP 客户端 | ![Axios](https://img.shields.io/badge/Axios-1.7.0-5A29E4?logo=axios&logoColor=white) |
| Expo Secure Store | 12.8.1 | 安全存储 | ![SecureStore](https://img.shields.io/badge/SecureStore-12.8.1-000020?logo=expo&logoColor=white) |

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 9.0.0
- Expo CLI (`npm install -g expo-cli`)
- iOS: macOS + Xcode
- Android: Android Studio + JDK

### 安装依赖

```bash
cd mobile-app
pnpm install
```

### 开发命令

```bash
pnpm run start      # 启动 Expo 开发服务器
pnpm run android    # 运行 Android
pnpm run ios        # 运行 iOS
pnpm run web        # 运行 Web 版本
pnpm run lint       # ESLint 检查
pnpm run type-check # TypeScript 类型检查
```

---

## 📁 项目结构

```
mobile-app/
├── src/
│   ├── screens/            # 页面组件
│   │   ├── HomeScreen.tsx
│   │   ├── DiscoverScreen.tsx
│   │   ├── PlayerScreen.tsx
│   │   ├── PlaylistScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── components/         # 可复用组件
│   │   ├── PlayerControls.tsx
│   │   ├── TrackList.tsx
│   │   └── PlaylistCard.tsx
│   ├── stores/             # Zustand 状态管理
│   │   ├── authStore.ts    # 认证状态
│   │   └── playerStore.ts  # 播放器状态
│   ├── services/           # API 服务层
│   │   ├── api.ts          # Axios 实例
│   │   └── authService.ts  # 认证服务
│   ├── hooks/              # 自定义 Hooks
│   ├── utils/              # 工具函数
│   └── types/              # TypeScript 类型
├── App.tsx                 # 根组件
├── app.json                # Expo 配置
├── babel.config.js         # Babel 配置
└── package.json
```

---

## 📐 开发规范

### 组件规范

```typescript
import { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface Props {
  title: string
  onPress?: () => void
}

export default function MyComponent({ title, onPress }: Props) {
  const [count, setCount] = useState(0)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold' },
})
```

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件/页面 | PascalCase | `HomeScreen.tsx` |
| 工具函数 | camelCase | `formatTime.ts` |
| 样式对象 | camelCase | `styles.container` |
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL` |

---

## 🐻 状态管理

### Auth Store

```typescript
import { useAuthStore } from '../stores/authStore'

function ProfileScreen() {
  const { user, isAuthenticated, actions } = useAuthStore()

  const handleLogout = () => {
    actions.logout()
  }

  return (
    <View>
      <Text>{user?.username}</Text>
      <Button title="退出登录" onPress={handleLogout} />
    </View>
  )
}
```

### Player Store

```typescript
import { usePlayerStore } from '../stores/playerStore'

function PlayerScreen() {
  const { currentTrack, isPlaying, actions } = usePlayerStore()

  return (
    <View>
      <Text>{currentTrack?.title}</Text>
      <Button
        title={isPlaying ? '暂停' : '播放'}
        onPress={() => actions.togglePlay()}
      />
    </View>
  )
}
```

---

## 🌐 API 层

### Axios 配置

```typescript
// src/services/api.ts
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const api = axios.create({
  baseURL: 'http://localhost:25101/api',
  timeout: 10000,
})

// 请求拦截器 - 从 SecureStore 读取 Token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

### 使用 Service

```typescript
import * as authService from '../services/authService'

// 登录
const { token, user } = await authService.login({ email, password })

// 获取用户信息
const { user } = await authService.getProfile()
```

---

## 🛤️ 导航路由

```typescript
// App.tsx
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Playlists" component={PlaylistScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Player" component={PlayerScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
```

---

## 🔐 安全存储

### Token 存储

```typescript
import * as SecureStore from 'expo-secure-store'

// 存储 Token
await SecureStore.setItemAsync('auth_token', token)
await SecureStore.setItemAsync('refresh_token', refreshToken)

// 读取 Token
const token = await SecureStore.getItemAsync('auth_token')

// 删除 Token
await SecureStore.deleteItemAsync('auth_token')
```

### 为什么使用 SecureStore？

| 存储方式 | 安全性 | 适用场景 |
|----------|--------|----------|
| SecureStore | ⭐⭐⭐⭐⭐ | Token、密码等敏感数据 |
| AsyncStorage | ⭐⭐ | 用户偏好设置等非敏感数据 |

---

## 📦 构建发布

### Expo 构建

```bash
# 登录 Expo
expo login

# 构建 iOS
expo build:ios

# 构建 Android
expo build:android

# EAS 构建（推荐）
eas build --platform ios
eas build --platform android
```

### 本地构建

```bash
# iOS
cd ios
pod install
cd ..
npx react-native run-ios

# Android
cd android
./gradlew assembleRelease
cd ..
npx react-native run-android
```

---

## 🧪 测试

```bash
pnpm run test              # 运行单元测试
pnpm run test:e2e:ios      # iOS E2E 测试
pnpm run test:e2e:android  # Android E2E 测试
```

---

## 🏗️ 五高五标五化

### 五高原则

| 原则 | 实现 | 状态 |
|------|------|------|
| **高可用性** | Expo 热更新 + 错误边界 + 离线支持 | ✅ |
| **高性能** | 图片懒加载 + 列表虚拟化 + 缓存策略 | ✅ |
| **高安全性** | SecureStore + JWT 双令牌 + 证书固定 | ✅ |
| **高扩展性** | 组件化架构 + 跨平台代码复用 | ✅ |
| **高可维护性** | TypeScript + ESLint + 统一规范 | ✅ |

### 五标体系

| 标准 | 实现 | 状态 |
|------|------|------|
| **标准化** | React Native 最佳实践 + Expo 规范 | ✅ |
| **规范化** | 命名规范 + 目录结构 + 代码审查 | ✅ |
| **自动化** | CI/CD + 自动化测试 + 热更新 | ✅ |
| **智能化** | AI 推荐 + 智能缓存 + 自适应布局 | ✅ |
| **可视化** | 性能监控 + 崩溃分析 + 用户行为 | ✅ |

### 五化架构

| 架构 | 实现 | 状态 |
|------|------|------|
| **流程化** | Git Flow + 敏捷开发 + 代码审查 | ✅ |
| **文档化** | 组件文档 + API 文档 + 发布说明 | ✅ |
| **工具化** | Expo CLI + React Native CLI + Flipper | ✅ |
| **数字化** | 性能指标 + 用户分析 + 崩溃报告 | ✅ |
| **生态化** | Expo 生态 + npm 生态 + 原生模块 | ✅ |

---

## 🔗 相关链接

- [Expo 文档](https://docs.expo.dev/)
- [React Native 文档](https://reactnative.dev/)
- [React Navigation 文档](https://reactnavigation.org/)
- [Expo SecureStore 文档](https://docs.expo.dev/versions/latest/sdk/securestore/)

---

<div align="center">

> **「YanYuCloudCube」**
> **「admin@0379.email」**
> **「Words Initiate Quadrants, Language Serves as Core for Future」**
> **「All things converge in cloud pivot; Deep stacks ignite a new era of intelligence」**

</div>
