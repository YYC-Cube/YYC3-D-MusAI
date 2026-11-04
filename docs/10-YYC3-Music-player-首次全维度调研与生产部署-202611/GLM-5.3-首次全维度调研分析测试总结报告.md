---
file: GLM-5.3-首次全维度调研分析测试总结报告.md
title: MusAI 缪斯智音 · 首次全维度调研分析测试总结报告
description: 零前置认知全维度调研：信息采集/深度分析/测试验证/系统总结/协作对接，含 YYC³ 设备矩阵衔接
author: GLM-5.3 (ZCode Agent) <admin@0379.email>
version: v1.0.0
created: 2026-11-04
updated: 2026-11-04
status: stable
tags: [survey, analysis, testing, deployment-readiness]
category: report
language: zh-CN
audience: developers,managers
complexity: advanced
project: yyc3-musai
phase: survey
doc_type: survey-report
model: GLM-5.3
session: 首次调研与生产部署会话
retention: permanent
---

# MusAI 缪斯智音 · 首次全维度调研分析测试总结报告

> **调研执行**：GLM-5.3（ZCode Agent）· 2026-11-04
> **方式**：零前置认知全库扫描 + 本机实测（依赖安装 / 三端测试 / 生产构建 / 依赖审计 / SSH 节点巡检）
> **授权口径**：自本报告起至生产落地部署上线，均由本会话（GLM-5.3）负责执行

---

## 一、全面信息采集

### 1.1 业务层

| 维度 | 内容 |
|---|---|
| **核心目标** | AI 驱动的新一代智能音乐平台（Music × Muse × AI）：智能发现、沉浸播放、AI 创作、音乐社交、多端协同 |
| **适用场景** | 个人音乐消费 + 社交歌单协作 + AI 辅助创作 |
| **用户群体** | 待确认（文档无明确用户画像；建议向产品负责人确认） |
| **核心流程** | 注册/登录 → 发现（推荐/搜索）→ 播放（可视化/歌词同步）→ 歌单管理 → 社交（实时聊天/分享） |
| **关键功能** | ✅ 已实现：认证（JWT 双令牌）、歌曲库、Socket.IO 聊天、播放器、歌单；⚠️ 半成品：AI 推荐（代码在但路由未挂载）；📄 纯前端模拟：AI 歌词生成、情感推荐 |
| **非功能需求** | 性能/安全/可用性均有工程痕迹（helmet/限流/健康检查/Lighthouse 基线），但无数值化 SLO —— **待确认** |

### 1.2 技术层

| 层 | 技术栈（实测版本） |
|---|---|
| **前端 Web** | React 18.3.1 + Vite 6.4 + TypeScript 5.6 + Tailwind v4 + shadcn/ui + Zustand 4.5 + 原生 Audio（Howler 已移除）+ Vitest + Playwright |
| **后端 API** | Express 4.22 + TypeScript 5.5 + Sequelize 6.37 + Socket.IO 4.8 + JWT 双令牌 + Joi 校验 + Winston 日志 |
| **数据层** | MySQL 8.0（utf8mb4）+ Redis 7（AOF + LRU） |
| **移动端** | Expo 57 + React Native 0.87 + Jest + Detox（README 徽章 Expo 50/RN 0.73 已漂移） |
| **部署** | Docker Compose（MySQL/Redis/Backend/Frontend-nginx 四容器）+ GitHub Pages（仅前端静态壳） |
| **CI/CD** | GitHub Actions（ci-cd.yml + gitleaks.yml）+ Dependabot + Snyk/Trufflehog（全为容错模式） |

### 1.3 代码层

- **仓库**：`ssh://git@ssh.github.com:443/YYC-Cube/YYC3-D-MusAI.git`（main 分支，无 tag）
- **结构**：pnpm workspace 四包：`frontend/` `backend/` `mobile-app/` `shared/types/`
- **分层**：后端 routes→controllers→services→models 标准四层；前端 pages/stores/services/lib
- **入口**：后端 `backend/src/index.ts`；前端 `frontend/src/main.tsx`；移动端 `expo-router/entry`
- **端口约定**：前端 20101 / 后端 25101
- **文档**：`docs/00~09` 十阶段全生命周期文档体系，完备度高

### 1.4 协作层

| 维度 | 现状 |
|---|---|
| 干系人 | 实质单人项目（YYC-Cube）+ Dependabot + AI 协作者（本会话） |
| 提交规范 | ✅ Conventional Commits（git log 实际执行良好） |
| 评审流程 | ✅ PR 制（main 受保护）；但 CI 无实质门禁（P0-3） |
| 发布周期 | push main → GitHub Actions → GitHub Pages；无版本 tag、无 release 记录 |
| 反馈渠道 | GitHub Issues + SECURITY.md 私密披露 |

### 1.5 YYC³ 设备矩阵衔接（生产部署资源，来源：`~/models/YYC3-OPS`）

**7 节点全 SSH 可达，局域网 192.168.3.0/24 静态绑定 + 全端 Tailscale：**

| 节点 | 角色 | 与 MusAI 部署的关系 |
|---|---|---|
| `yyc3-22`（本机） | 主控 + PG15.15 主库@5433 + Redis 主@6379 | 开发/构建机，PG 主库所在 |
| `yyc3-45`（NAS, Ubuntu 22.04/TOS） | **19 容器运行中** + MariaDB 10.3@3306 + PG15.15 备库@5433 + Redis 从@6399 | **MusAI 容器化部署主目标** |
| `yyc3-33`（ECS 公网 39.97.53.176） | 唯一公网入口：traefik(80/443) + frps + PG16.15 | **对外反代入口** |
| `yyc3-n1/n2`（DGX GB10） | AI 推理 | 未来 AI 推荐引擎算力 |
| `yyc3-77` / `yyc3-66` | 辅助算力 / Windows 测试 | 非生产路径 |

**music 生态实况（2026-11-04 SSH 实测）：**

| 资产 | 实况 |
|---|---|
| `yyc3-music-api` 容器（yyc3-45） | Node 20 `src/server.js`，host 网络 **:3113**，restart=always；读 PG 备库（45:5433）/写 PG 主库（22:5433 走 Tailscale 100.87.159.21）；挂载实体音乐库 `/Volume1/yyc3_hd/Music → /music`；CORS 允许 `https://yyc-cube.github.io` |
| PG `yyc3_music` 库 | **25 表**（musics/albums/playlists/follows/likes/comments/messages/shares/rankings/star_power/achievements/spacetime_capsules 等），165 条音乐记录、1 用户、ai_works 0 |
| 实体音乐库 | `/Volume1/yyc3_hd/Music` 5 个目录（沫言/沫语/董小姐-Music 等） |
| MariaDB `yyc3_music` 库（45:3306） | 21 表（经管源库，与 PG 库同名不同源）；C42 已 iptables 限源（LAN/TS/lo） |

> **判定**：`yyc3-music-api` 是已在线的**另一套轻量音乐服务**（PG 体系），与 MusAI（MySQL 体系）**并存不冲突**。MusAI 部署于 yyc3-45 时使用独立端口 25101 + 独立 MySQL 容器，两者可共存；后续演进可评估 MusAI 接入 PG `yyc3_music` 数据或统一品牌。

---

## 二、深度维度分析（现状 + 问题 + 影响）

### 2.1 架构合理性 ⭐⭐⭐⭐
- **现状**：routes/controllers/services/models 四层清晰、pnpm monorepo、shared/types 跨端契约、Docker 多阶段构建 + 非 root 用户。
- **问题**：①`recommendationRoutes.ts` 已实现但 `backend/src/index.ts:42-43` 未挂载——README 承诺的 `/api/recommendations` 实际 404；②前端"真实 API + mock 数据"双轨并存，数据源边界模糊。
- **影响**：推荐引擎（核心卖点）不可达；上线后 AI 能力为空壳。

### 2.2 代码质量 ⭐⭐⭐½
- **现状**：TS 严格模式全端启用；统一响应 `ApiResponse<T>`；Joi 校验、bcrypt、Sequelize 参数化查询（无 SQL 注入拼接）。
- **问题**：14 个测试与实现脱节——commit `4f71681` 移除 Howler 改原生 Audio 后测试未同步（playerStore×5、LoginPage×4、Navigation×2、HomePage×1）；`middleware/auth.ts` 新旧双令牌机制并存（`generateToken` 已标弃用）。
- **影响**：回归安全网失效；双认证路径增加攻击面与维护成本。

### 2.3 技术债务 ⭐⭐⭐
- **现状**：Dependabot 活跃，gitleaks 守门。
- **问题**：README 版本徽章漂移（Express/Expo/RN/ReactRouter）；`backend/.env.test` 未被 `.gitignore` 覆盖（untracked，随时可能误提交）。
- **影响**：版本误判；低风险但违反自家安全规范。

### 2.4 性能风险 ⭐⭐⭐½
- **现状**：manualChunks 分包合理（实测构建 1.54s、gzip ~135KB）；Redis 缓存 + 连接池配置在。
- **问题**：全局限流 100 req/15min 覆盖 `/api` 全部接口，歌曲列表/搜索等公开高频接口与登录共享配额；搜索无分页上限证据。
- **影响**：正常浏览可触发 429 误伤；并发增长后搜索是首个瓶颈。

### 2.5 安全风险 ⭐⭐½
- **现状**：helmet + CORS 白名单 + 限流 + bcrypt + httpOnly Cookie + Joi + 非 root 容器用户。
- **问题**：①依赖漏洞 backend 45（**2 critical：handlebars 模板注入、proxy-addr IP 欺骗**）、mobile 47（2 critical）、frontend 22（5 high）；②docker-compose 硬编码默认密码 + MySQL/Redis 端口映射宿主机全接口；③令牌 localStorage + Cookie 双存储冗余（XSS 面）。
- **影响**：公网部署瞬间即现实攻击面；需在上线前完成 critical 清零 + 默认密码强制注入。

### 2.6 可维护性 ⭐⭐⭐⭐
- **现状**：docs/00~09 全生命周期文档 + 健康检查 + Winston 结构化日志 + sequelize-cli 迁移体系 + YYC3-OPS 设备矩阵台账（7 节点 SSOT）。
- **问题**：trace-id 前端已发（X-Request-ID）但后端日志未消费；Pages 静态壳与真实后端关系未闭环。
- **影响**：生产排障需人工比对两端日志。

**六维总评：3.6 / 5 —— 工程骨架专业，距生产可用差确定性修复，无需推翻重来。**

---

## 三、测试验证执行（本机实测闭环）

### 3.1 实测结果汇总

| 端 | 命令 | 结果 | 明细 |
|---|---|---|---|
| 后端 | `jest` | ⚠️ **117/119 通过，2 失败** | `authController › login` 2 例：bcrypt/模型 mock 与真实流程脱节致 500 |
| 前端 | `vitest run` | ⚠️ **70/82 通过，12 失败** | playerStore×5（仍 mock howler）、LoginPage×4、Navigation×2、HomePage×1 |
| 移动端 | `jest` | ❌ **0 可执行** | `preset: 'react-native'` 在 RN 0.87 + pnpm 下解析失败 |
| 构建 | `vite build` | ✅ 成功 1.54s | ~135KB gzip（vendor 59 + index 59 + css 14） |
| 漏洞 | `npm audit` | ❌ 114 项 | backend 45（2C）/ mobile 47（2C）/ frontend 22（5H） |

### 3.2 核心功能测试用例（可执行）

| 优先级 | 模块 | 用例 | 类型 | 预期结果 |
|---|---|---|---|---|
| P0 | 认证 | 合法注册（邮箱+密码≥6） | 正向 | 201 + 双令牌 + httpOnly Cookie |
| P0 | 认证 | 重复邮箱/用户名 | 反向 | 409 区分文案 |
| P0 | 认证 | 密码<6 / 邮箱非法 | 反向 | 400 + Joi details |
| P0 | 认证 | 过期 access + 有效 refresh 刷新 | 正向 | 新令牌对 |
| P1 | 歌曲 | `GET /api/songs` 免认证 | 正向 | 200 + 分页 |
| P1 | 歌曲 | 搜索含空格/emoji/SQL 特殊字符 | 边界 | 参数化过滤无注入 |
| P1 | 歌曲 | 超大页码/负数 limit | 边界 | 400 或钳制 |
| P1 | 推荐 | `GET /api/recommendations` | 正向 | **当前必 404（未挂载）→ 修复后回归** |
| P2 | 聊天 | 未认证 `send_message` | 反向 | 拒绝/断开 |
| P2 | 上传 | >10MB / 非音频 MIME | 反向 | 413/400 落盘前拦截 |
| P2 | 限流 | 同 IP 15min 第 101 请求 | 边界 | 429 |

**边界清单**：Redis 宕机降级、DB 连接池耗尽、播放队列当前曲移除后指针、移动端离线令牌续期、PWA 断网缓存一致性。

**通过/失败标准**：
- ✅ 通过 = 单测全绿 + 认证/播放/歌单 E2E 绿 + audit 无 critical/high + 构建达 Lighthouse 基线
- ❌ 失败 = 任一 P0 用例失败 / 任一 critical 未修 / CI 真门禁下任一关卡红

---

## 四、系统性总结

### 4.1 项目整体画像

> **一句话**：一座文档与工程骨架极其专业、但「线上只有静态壳、质量门禁形同虚设」的 AI 音乐平台半成品——距真实生产上线还差 **3 个 P0 阨断 + 14 个失败测试**。

**核心标签**：`全栈TypeScript` `Monorepo` `文档超备` `CI假绿` `推荐引擎未接线` `静态壳上线`

### 4.2 问题分级清单

| 级别 | 问题 | 证据 |
|---|---|---|
| **P0-1** | Docker 构建参数名错配：Dockerfile/compose 传 `VITE_API_URL`，代码读 `VITE_API_BASE_URL` → 容器化前端 API 永远指向 localhost | `frontend/Dockerfile:15-19`、`frontend/src/lib/api.ts:17` |
| **P0-2** | 生产无建表流程：`index.ts:82` 生产跳过 syncDatabase + Dockerfile CMD 不跑 migrate → 空库上线业务全 500 | `backend/Dockerfile` CMD |
| **P0-3** | CI 全关卡 `continue-on-error: true`/`|| true` → 测试失败照样部署，门禁虚设 | `.github/workflows/ci-cd.yml:60-88` |
| **P1-1** | 推荐路由未挂载，核心 AI 卖点 404 | `backend/src/index.ts:42-43` |
| **P1-2** | 前端 12 + 后端 2 失败测试 | 本机实测 |
| **P1-3** | 移动端 Jest preset 损坏 0 可跑 | `mobile-app/jest.config.js:2` |
| **P1-4** | 依赖 4 critical + 11 high | npm audit |
| **P1-5** | docker-compose 默认密码硬编码 + 端口全暴露 | `docker-compose.yml:9,35` |
| **P2-1** | `.env.test` 不在 .gitignore | `.gitignore` |
| **P2-2** | 全局限流误伤公开高频接口 | `index.ts:34-39` |
| **P2-3** | localStorage + Cookie 双令牌存储冗余 | `authStore.ts` |
| **P2-4** | README 版本徽章漂移 | `README.md:23,140` |
| **P3** | detox 构建脚本被 pnpm 忽略、弃用函数未清理、trace-id 链路断裂 | — |

### 4.3 优化优先级与落地路线

**短期（本周，解锁真上线能力）**
1. P0-1：Dockerfile/compose 构建参数统一 `VITE_API_BASE_URL`
2. P0-2：backend 容器 entrypoint 增加 `db:migrate`（幂等）
3. P0-3：CI 移除全部 continue-on-error，门禁真化
4. 修复 14 个失败测试 + 挂载 recommendationRoutes
5. `.gitignore` 收编 `.env.test`

**中期（2~4 周）**
1. `npm audit fix` + handlebars/proxy-addr 强制升级，CI audit 阻断 critical
2. compose 移除默认密码 fallback + 端口改绑 127.0.0.1/Tailscale
3. 移动端 Jest preset 修复
4. 公开接口独立宽松限流

**长期（1~2 月）**
1. 后端真部署：yyc3-45 容器化 + yyc3-33 公网反代 + HTTPS
2. 监控：trace-id 贯穿 + Uptime + 慢查询日志（可接入 45 已有 Prometheus/Loki/Grafana 栈）
3. E2E + Lighthouse 回归纳入 CI 门禁

### 4.4 可行性与风险结论

- **可行性：✅ 高**——技术选型主流、分层专业、构建链路实测通畅；距上线只差确定性修复。
- **主要风险**：①CI 假绿掩盖真实质量；②Pages 静态壳营造"已上线"错觉（真实后端从未部署）；③critical 漏洞公网部署即现实攻击面。
- **结论**：修复短期清单后即具备生产上线条件；P0 修复前禁止公网部署。

### 4.5 下一步核心动作

P0-1 参数名修复（10min）→ P0-3 CI 门禁 → 14 测试修复 → P0-2 迁移入口 → `docker-compose up` 全链路验证 → yyc3-45/yyc3-33 生产部署。

---

## 五、协作对接指引

| 对接方 | 沟通事项 | 渠道/频次 |
|---|---|---|
| YYC-Cube（所有者） | P0 修复授权（已授予）、生产环境选型（已定：yyc3-45 + yyc3-33）、域名/HTTPS 权限 | GitHub PR + 本会话 |
| Dependabot | 短期清单完成前暂停非安全类升级合并 | PR |
| AI 协作者（GLM-5.3 会话） | 测试修复/路由挂载/CI 改造/部署执行 | 本会话持续 + 项目记忆 |
| 安全披露 | critical 修复期暂缓公网暴露 | SECURITY.md |

**同步机制**：会话结束写项目记忆；修复走 Conventional Commits + PR。
**唯一流程卡点**：CI 假绿 → 已列为 P0-3，门禁真化后 PR 评审恢复数据支撑。
**变更/问题路径**：功能 → Issue(feat) → PR；缺陷 → Issue(fix)；安全 → SECURITY.md。

---

*调研执行：GLM-5.3 · 证据可复现（本机实测 + SSH 巡检）· 2026-11-04*
