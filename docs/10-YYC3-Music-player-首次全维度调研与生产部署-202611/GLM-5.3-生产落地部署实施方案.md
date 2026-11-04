---
file: GLM-5.3-生产落地部署实施方案.md
title: MusAI 缪斯智音 · 生产落地部署实施方案
description: 衔接首次调研报告与 YYC³ 设备矩阵的生产部署实施方案 — S1~S6 阶段、目标架构、验收与回滚
author: GLM-5.3 (ZCode Agent) <admin@0379.email>
version: v1.0.0
created: 2026-11-04
updated: 2026-11-04
status: active
tags: [deployment, implementation-plan, production]
category: plan
language: zh-CN
audience: developers,managers
complexity: advanced
project: yyc3-musai
phase: deployment
doc_type: implementation-plan
model: GLM-5.3
retention: permanent
---

# MusAI 缪斯智音 · 生产落地部署实施方案

> **依据**：《GLM-5.3-首次全维度调研分析测试总结报告》+ YYC³ 设备矩阵台账（`~/models/YYC3-OPS`）
> **执行**：GLM-5.3 会话全程负责，直至生产上线验证完成
> **部署目标**：yyc3-45（NAS 容器宿主）+ yyc3-33（ECS 公网入口）

---

## 一、目标生产架构

```text
                    用户（公网）
                        │ HTTPS :443
              ┌─────────▼─────────┐
              │  yyc3-33 (ECS)    │  ← 唯一公网入口 39.97.53.176
              │  traefik v3 :80   │     musai.yyc3.top → 反代
              │  (已有 2 容器共存) │
              └────┬─────────┬────┘
                   │ HTTP    │ (Tailscale 100.65.172.88 / LAN 192.168.3.45)
              ┌────▼─────────▼──────────────┐
              │  yyc3-45 (NAS · TOS/Ubuntu)  │
              │  ┌────────────────────────┐ │
              │  │ musai-frontend (nginx) │ │ :20101  ← 静态壳（可选，Pages 为主）
              │  │ musai-backend (node20) │ │ :25101  ← Express API + Socket.IO
              │  │ musai-mysql   (8.0)    │ │ 内部    ← d_music 库
              │  │ musai-redis   (7)      │ │ 内部    ← 缓存
              │  └────────────────────────┘ │
              │  （共存：yyc3-music-api:3113 │
              │    及其余 19 容器不受影响）   │
              └─────────────────────────────┘
                   │ 数据面
              MySQL 容器卷 → /Volume2 部署树（2T 薄卷，21% 余量充足）
```

**共存约束**（来自设备矩阵实测）：
1. 端口 25101/20101 在 yyc3-45 空闲；避开已占用：3113(music-api)、8000(gateway)、8080(gitbucket)、3000/33901(grafana)、9090/9093/3100(prom/alert/loki)、3306/5433/5434/6399 等。
2. 45 的 Volume3（Docker 应用层）已 47%，MusAI 四容器新增占用可控（镜像 ~400MB + 卷）。
3. `yyc3-music-api` 使用 PG 体系，MusAI 用独立 MySQL 容器——**数据面完全隔离**，不触碰 45:3306 MariaDB 与 5433/5434 PG。
4. yyc3-33 上只加 traefik 路由规则（文件 provider），不动已有 `yyc3-leisure-edge` / `docker-traefik-1`。

**域名与 HTTPS**：`musai.yyc3.top`（需 DNS A 记录 → 39.97.53.176 + traefik 证书解析器；DNS 未就绪前先以 `http://39.97.53.176` 路径路由灰度验证）——DNS/证书为外部依赖，**待确认**项。

---

## 二、阶段计划（S1→S6）

### S1 代码修复（P0 ×3 + P1，本机 yyc3-22）

| # | 任务 | 文件 | 验证 |
|---|---|---|---|
| 1.1 | 构建参数名统一 `VITE_API_BASE_URL` | `frontend/Dockerfile`、`docker-compose.yml` | 构建产物中 grep 无 localhost 硬编码 |
| 1.2 | backend 容器迁移入口：entrypoint 先 `db:migrate` 再启动；compose 加 `command` | `backend/Dockerfile`、`docker-compose.yml` | 空库启动后 `SHOW TABLES` 有表 |
| 1.3 | CI 门禁真化：移除全部 `continue-on-error`/`\|\| true` | `.github/workflows/ci-cd.yml` | PR 红灯可见 |
| 1.4 | 挂载 `recommendationRoutes` | `backend/src/index.ts` | `/api/recommendations` 200（带 token） |
| 1.5 | 修 12 前端测试（对齐原生 Audio 行为） | `frontend/src/__tests__/*` | vitest 82/82 |
| 1.6 | 修 2 后端测试（bcrypt mock 链路） | `authController.test.ts` | jest 119/119 |
| 1.7 | `.gitignore` 收编 `.env.test` | `.gitignore` | `git status` 干净 |
| 1.8 | compose 安全基线：去默认密码 fallback、MySQL/Redis 不映射宿主端口（容器网内互访） | `docker-compose.yml` | `docker compose config` 校验 |
| 1.9 | 移动端 Jest preset 修复（`@react-native/jest-preset` 显式依赖） | `mobile-app/` | jest 可执行 |
| 1.10 | `npm audit fix`（非破坏）+ critical 依赖升级评估 | 三端 package.json | audit 无 critical |

**S1 通过标准**：三端测试全绿 + 前后端构建成功 + `docker-compose config` 通过 + audit 无 critical。

### S2 本机全链路验证（yyc3-22，Docker Desktop 未装 → 以 compose dry-run + pnpm 起服替代）

> 实测 yyc3-22 **未安装 Docker**（设备矩阵 C 记录），本机验证调整为：
> - 后端直跑（pnpm dev + 本机已有 MySQL 不可用 → 用 Docker 方案在 S3 首验），
> - 或直接以 **S3 远端验证替代 S2**（推荐：45 才有容器运行时）。
> **决策：S2 合并入 S3**——在 45 上以 `docker compose up` 完成首次全链路验证，浏览器/ curl 冒烟。

### S3 yyc3-45 容器化部署（核心）

| # | 任务 | 说明 |
|---|---|---|
| 3.1 | 代码投递：git pull 或 rsync 至 `45:/Volume2/yyc3-apps/musai/`（部署树，与 @apps 分离） | 45 上无 Node 开发链，纯容器部署 |
| 3.2 | 生产 env：`backend/.env.production` 不入库，SSH 直接注入 compose 环境段（密码/ JWT 由会话生成强随机值并回填设备矩阵密钥流程） | 遵循 C33 教训：凭证不入库 |
| 3.3 | `docker compose -f docker-compose.prod.yml up -d --build` | 新增 prod compose：只含 musai 四容器、MySQL/Redis 无宿主端口映射、加 `internal` 网络 |
| 3.4 | 冒烟：`/api/health` 200 → 注册/登录/歌曲列表 curl 断言 | 通过标准见 §四 |
| 3.5 | 回滚预案：`docker compose down` + 卷删除（数据卷独立命名 musai_*，误删不影响 19 个既有容器） | 回滚 < 5 分钟 |

### S4 yyc3-33 公网入口（traefik 路由）

| # | 任务 | 说明 |
|---|---|---|
| 4.1 | traefik 文件 provider 加 `musai-router`：`Host(\`musai.yyc3.top\`) || PathPrefix(\`/musai\`)` → `http://100.65.172.88:25101`（Tailscale IP，跨公网→内网不暴露 45 公网面） | 不动 33 上 traefik 既有动态配置结构 |
| 4.2 | 前端访问路径决策：GitHub Pages 壳（`VITE_API_BASE_URL=https://musai.yyc3.top/api`）为主；45 nginx 壳为内网备用 | CORS：backend `FRONTEND_URL` 增补 GitHub Pages 域 |
| 4.3 | HTTPS：复用 traefik 证书解析器（已有 443）；DNS A 记录待确认，未就绪前以 IP+路径灰度 | 外部依赖 |

### S5 监控接入（复用 45 既有栈）

- backend 暴露 `/api/health`（已有）+ musai 容器接入 45 的 Prometheus（`yyc3-prometheus`）与 Loki（`yyc3-loki`）——最小做法：compose 加 promtail 或复用节点 fluent-bit；**首轮仅做 health 探针 + 容器重启策略，深度监控放二期**。

### S6 上线验收与移交

| 项 | 标准 |
|---|---|
| 功能 | 注册→登录→歌曲列表→播放器（Web）全链路通 |
| API | `/api/health` `/api/songs` `/api/auth/login` `/api/recommendations` 全部预期响应 |
| 韧性 | 容器 restart=always；`docker compose down/up` 数据不丢 |
| 安全 | 3306/6379 无宿主映射；JWT ≥32 随机；audit 无 critical |
| 共存 | 既有 19 容器全部仍 Up；45 负载 < 3.0 |
| 文档 | 本方案状态更新 + 节点台账回填 + 记忆沉淀 |

---

## 三、风险与回滚

| 风险 | 缓解 |
|---|---|
| 45 Docker 卷/磁盘压力（V3 已 47%） | 部署前 `df` 复核；镜像用 alpine 基底；MySQL 数据卷落 Volume2 |
| MariaDB/PG 同机混淆 | MusAI MySQL 容器**不映射宿主端口**，物理隔离 |
| 33 公网面扩大 | 只在 traefik 加路由，不放通新端口；安全组维持现状（C41 SG 收口另行推进） |
| 22→45 Tailscale 抖动 | 部署链路走 LAN 192.168.3.x 优先 |
| 依赖升级破坏构建 | S1 每步独立 commit，可逐粒回滚 |
| 手机端无法即时验收 | 移动端仅恢复测试可执行性，上线验收以 Web 为准（Expo 构建另立任务） |

**总回滚**：45 删除 musai 四容器 + musai_* 卷（<5min，零影响既有服务）；33 删除 traefik musai 路由段（热重载）。

---

## 四、上线判定（Go/No-Go）

- ✅ **Go** = S1 全绿 + S3 冒烟通过 + S6 表格逐项满足
- ❌ **No-Go** = 任一 P0 复现、既有 19 容器任一受影响、45 负载 >3.6、公网面出现未登记端口

## 五、执行记录（会话内实时回填）

| 时间 | 阶段 | 动作 | 结果 |
|---|---|---|---|
| 2026-11-04 | S0 | 调研报告 + 本方案产出 | ✅ |
| （执行中实时追加） | | | |

---

*执行：GLM-5.3 会话 · 衔接《首次全维度调研分析测试总结报告》· 设备事实以 YYC³ 设备矩阵台账 v2.6.0 为准*
