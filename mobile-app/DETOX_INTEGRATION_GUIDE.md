# D-Music Mobile - Expo + Detox E2E 测试完整集成指南

## 📋 目录
- [环境要求](#-环境要求)
- [方案选择](#-方案选择)
- [方案A：EAS Build 云端构建（推荐）](#-方案aeas-build-云端构建推荐)
- [方案B：本地构建](#-方案b本地构建)
- [运行E2E测试](#-运行e2e测试)
- [常见问题解决](#-常见问题解决)

---

## 🎯 环境要求

### 必需工具
```bash
# Node.js >= 18
node --version  # 应显示 v18.x 或更高

# Expo CLI
npm install -g expo-cli

# EAS CLI (用于云端构建)
npm install -g eas-cli

# iOS 开发工具 (macOS only)
# - Xcode >= 15 (从 App Store 安装)
# - Xcode Command Line Tools: xcode-select --install
# - CocoaPods: sudo gem install cocoapods

# Android 开发工具
# - Android Studio
# - ANDROID_HOME 环境变量
# - 模拟器: Pixel_6_API_34 或类似

# Detox CLI
npm install -g detox-cli

# iOS 模拟器工具 (可选)
xcrun simctl list available  # 列出可用模拟器
```

---

## 🚀 方案选择

| 方案 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| **A: EAS Build** | ✅ **推荐用于CI/CD和团队协作** | 无需本地Xcode/CocoaPods，构建稳定 | 需要网络，首次配置稍复杂 |
| **B: 本地构建** | 快速迭代调试 | 即时反馈，完全控制 | 需要完整开发环境 |

---

## ☁️ 方案A：EAS Build 云端构建（推荐）

### 步骤 1：初始化 EAS 项目（如果尚未完成）
```bash
cd mobile-app
eas build:configure
```

### 步骤 2：更新 `eas.json` 配置

项目已包含优化的 EAS 配置，支持测试构建：

```json
{
  "cli": {
    "version": ">= 5.9.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "ios": { "simulator": true }
    },
    "production": {
      "distribution": "store",
      "android": { "buildType": "app-bundle" },
      "ios": { "autoIncrement": true }
    }
  }
}
```

### 步骤 3：添加测试专用构建配置

在 `eas.json` 的 `build` 部分添加：

```json
"test": {
  "distribution": "internal",
  "android": {
    "buildType": "apk",
    "type": "simulator"
  },
  "ios": {
    "simulator": true,
    "type": "simulator"
  }
}
```

### 步骤 4：使用 EAS 构建测试应用

#### 构建 iOS 应用
```bash
# 构建 Debug 版本（用于 Detox 测试）
eas build --platform ios --profile test --local

# 或者使用云端构建（更稳定）
eas build --platform ios --profile test
```

#### 构建 Android 应用
```bash
# 构建 Debug 版本
eas build --platform android --profile test --local

# 或云端构建
eas build --platform android --profile test
```

### 步骤 5：下载构建产物

构建完成后，EAS 会提供下载链接：
- iOS: `.app` 文件或直接安装到模拟器
- Android: `.apk` 文件

### 步骤 6：更新 Detox 配置指向 EAS 构建产物

修改 `detox.config.js` 中的 `binaryPath`：

```javascript
apps: {
  'ios.debug': {
    type: 'ios.app',
    // 指向 EAS 构建的 .app 文件路径
    binaryPath: 'path/to/eas-build/DMusic.app',
    // 移除 build 命令（因为已经构建好了）
  },
  'android.debug': {
    type: 'android.apk',
    // 指向 EAS 构建的 .apk 文件路径
    binaryPath: 'path/to/eas-build/app-debug.apk',
  }
}
```

---

## 💻 方案B：本地构建

### 前置条件检查

```bash
# 检查 Xcode
xcodebuild -version  # 应显示 Xcode 15.x

# 检查 CocoaPods
pod --version  # 如果未安装:
sudo gem install cocoapods

# 检查 accepted licenses
sudo xcodebuild -license accept
```

### iOS 本地构建步骤

#### 1. 生成原生代码（已完成✅）
```bash
# 已执行过:
npx expo prebuild --platform ios
```

#### 2. 安装 Pod 依赖
```bash
cd ios
pod install  # 这会生成 DMusic.xcworkspace
cd ..
```

**⚠️ 如果遇到 CocoaPods 问题：**
```bash
# 清理并重新安装
rm -rf ios/Pods ios/Podfile.lock
cd ios && pod install --repo-update
```

#### 3. 使用 Detox 构建
```bash
# 现在 workspace 文件已存在
npm run build:ios:debug
```

#### 4. 手动构建备选方案
```bash
# 如果 Detox 构建失败，可以手动构建：
xcodebuild \
  -workspace ios/DMusic.xcworkspace \
  -scheme DMusic \
  -configuration Debug \
  -sdk iphonesimulator \
  -derivedDataPath ios/build \
  -UseModernBuildSystem=YES
```

### Android 本地构建步骤

#### 1. 生成原生代码
```bash
npx expo prebuild --platform android
```

#### 2. 构建 APK
```bash
cd android
./gradlew assembleDebug
./gradlew assembleAndroidTest
cd ..
```

---

## 🧪 运行 E2E 测试

### 准备工作

#### 启动设备/模拟器

**iOS 模拟器：**
```bash
# 打开 iPhone 15 Pro 模拟器 (iOS 17.0)
open -a Simulator
xcrun simctl boot "iPhone 15 Pro"

# 或创建新的模拟器
xcrun simctl create "iPhone 15 Test" "iPhone 15 Pro" "iOS17.0"
```

**Android 模拟器：**
```bash
# 确保 Android 模拟器正在运行
emulator -avd Pixel_6_API_34 &

# 等待模拟器完全启动
adb wait-for-device
```

### 运行测试命令

#### 完整测试套件
```bash
# iOS Debug 模式
npm run test:e2e:ios:debug

# iOS Release 模式
npm run test:e2e:ios:release

# Android Debug 模式
npm run test:e2e:android:debug

# Android Release 模式
npm run test:e2e:android:release
```

#### 单个测试文件
```bash
# 只运行登录流程测试
detox test --configuration ios.sim.debug e2e/LoginFlow.test.js

# 只运行主页测试
detox test --configuration ios.sim.debug e2e/HomeScreen.test.js
```

#### 带详细日志运行
```bash
# 详细输出模式
detox test --configuration ios.sim.debug --loglevel verbose

# 只记录失败的测试
detox test --configuration ios.sim.debug --record-logs failing
```

### 可用的 NPM 脚本

查看 `package.json` 中定义的所有脚本：

```json
{
  "scripts": {
    "start": "expo start",
    "test": "jest",
    
    // E2E 测试脚本
    "test:e2e:ios:debug": "detox test --configuration ios.sim.debug",
    "test:e2e:ios:release": "detox test --configuration ios.sim.release",
    "test:e2e:android:debug": "detox test --configuration android.emu.debug",
    "test:e2e:android:release": "detox test --configuration android.emu.release",
    
    // 构建脚本
    "build:ios:debug": "detox build --configuration ios.sim.debug",
    "build:ios:release": "detox build --configuration ios.sim.release",
    "build:android:debug": "detox build --configuration android.emu.debug",
    "build:android:release": "detox build --configuration android.emu.release"
  }
}
```

---

## 🔧 常见问题解决

### ❌ 问题 1：`'ios/DMusic.xcworkspace' does not exist`
**原因**: 未安装 CocoaPods 依赖  
**解决方案**:
```bash
cd ios && pod install && cd ..
```

### ❌ 问题 2：`command not found: pod`
**原因**: 未安装 CocoaPods  
**解决方案**:
```bash
# macOS (使用 Homebrew)
brew install cocoapods

# 或使用 Ruby Gem
sudo gem install cocoapods
```

### ❌ 问题 3：Xcode 插件加载失败
**错误信息**: `xcodebuild failed to load a required plugin`  
**解决方案**:
```bash
# 方法 1: 初始化 Xcode
xcodebuild -runFirstLaunch

# 方法 2: 重启模拟器服务
killall Simulator
xcrun simctl shutdown all
sudo xcodebuild -license accept

# 方法 3: 更新 Xcode (通过 App Store)
```

### ❌ 问题 4：Detox 配置格式过时
**错误信息**: `utilizes a deprecated all-in-one schema`  
**状态**: ✅ **已修复** - 当前配置已升级到 Detox 20.x 格式

### ❌ 问题 5：Expo prebuild 失败 - 缺少资源文件
**错误信息**: `ENOENT: no such file or directory, open './assets/icons/icon.png'`  
**状态**: ✅ **已修复** - 已创建占位符资源文件

**如需替换为真实图标**:
```bash
# 替换以下文件为您的实际图标:
./assets/icons/icon.png          (1024x1024)
./assets/adaptive-icon.png       (1024x1024)
./assets/splash.png              (1284x2778, for iPhone)
./assets/favicon.png              (48x48)
./assets/notification-icon.png   (48x48)
```

### ❌ 问题 6：Android 构建失败 - SDK 版本不匹配
**解决方案**:
```bash
# 检查已安装的 SDK
sdkmanager --list_installed

# 安装所需 SDK
sdkmanager "platforms;android-34" "build-tools;34.0.0"

# 设置 ANDROID_HOME
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
```

### ❌ 问题 7：测试超时或元素找不到
**解决方案**:
```javascript
// 在测试中使用 waitFor 和更长的超时时间
await waitFor(element(by.id('some-element')))
  .toBeVisible()
  .withTimeout(10000); // 增加到 10 秒
```

---

## 📊 测试覆盖范围

当前 E2E 测试套件包含：

| 测试文件 | 覆盖 Screen | 测试用例数 | 关键功能 |
|----------|-------------|------------|----------|
| `LoginFlow.test.js` | LoginScreen, RegisterScreen | 7 | 登录、验证、生物识别 |
| `HomeScreen.test.js` | HomeScreen | 8 | 推荐、最近播放、Tab切换 |
| `DiscoverScreen.test.js` | DiscoverScreen, SearchResults | 8 | 搜索、筛选、导航 |
| `PlayerScreen.test.js` | PlayerScreen | 9 | 播放控制、进度条、队列 |
| `LibraryScreen.test.js` | LibraryScreen, PlaylistDetail | 8 | 播放列表、下载、CRUD |
| `SettingsScreen.test.js` | SettingsScreen 及子页面 | 9 | 设置、通知、登出 |
| **总计** | **6个核心页面** | **49个** | **完整用户旅程** |

---

## 🎯 最佳实践建议

### 开发阶段
```bash
# 使用 development client 进行快速迭代
npx expo start --dev-client

# 单独运行相关测试
npm run test:e2e:ios:debug -- e2e/HomeScreen.test.js
```

### CI/CD 集成
```yaml
# GitHub Actions 示例 (.github/workflows/e2e.yml)
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build:ios:debug
      - run: npm run test:e2e:ios:debug
```

### 发布前验证
```bash
# 完整回归测试
npm run test:e2e:ios:release
npm run test:e2e:android:release

# 结合单元测试
npm test                    # Jest 单元测试
npm run test:e2e:ios:debug  # Detox E2E 测试
```

---

## 📞 获取帮助

- **Detox 官方文档**: https://wix.github.io/Detox/docs/
- **Expo 文档**: https://docs.expo.dev/
- **EAS Build 文档**: https://docs.expos.dev/build/introduction/
- **CocoaPods 指南**: https://cocoapods.org/

---

## ✅ 当前项目状态

- ✅ Detox 20.x 最新格式配置
- ✅ 6 个核心页面的完整 E2E 测试（49个测试用例）
- ✅ Expo 原生代码生成完成（iOS + Android）
- ✅ 占位符资源文件创建完成
- ⏳ 待完成：安装 CocoaPods 并构建应用
- ⏳ 待完成：运行完整的 E2E 测试套件

---

**最后更新**: 2026-05-23
**适用版本**: Expo SDK 50+, Detox 20.x, React Native 0.73+
