# 项目进度

> 规则见 `AGENTS.md`。每开始/完成一个功能都要更新本文件。
> 最近更新：2026-11-13

## 当前阶段

**P1 业务数据模型（进行中） / P2 登录与会话（已完成）**

- 已完成：P0 环境与脚手架、MySQL 8 + Prisma 7 连接层、`User` 表、RBAC 数据模型、15 角色 + 3 演示账号 seed、登录 API、登录页接入与全局守卫
- 下一步：确认下一张业务表；P3 权限中间件

## 功能进度

| 功能 | 状态 | 验收标准 | 涉及文件 | 验证结果 | 备注 |
|---|---|---|---|---|---|
| Nuxt 4 项目骨架 | 已完成 | 项目可启动，lint/typecheck 通过 | `nuxt.config.ts`、`app/` | `pnpm lint`、`pnpm typecheck` 通过 | 已清理 starter 模板内容 |
| Nuxt UI 4 + Tailwind CSS 4 | 已完成 | 页面样式生效 | `app/assets/css/main.css`、`app/app.vue` | 首页 Tailwind 样式正常 | 通过 Nuxt UI 集成 Tailwind 4 |
| MySQL 8 + Prisma 7 连接层 | 已完成 | `/api/health` 返回 `ok: true` | `prisma/`、`server/utils/db.ts`、`server/utils/prisma.ts`、`server/api/health.get.ts` | `{"ok":true,"database":"mysql","latencyMs":1}` | 仅连接层，无业务模型 |
| User 表 | 已完成 | `User` 模型可迁移，Prisma Client 可生成 | `prisma/schema.prisma`、`prisma/migrations/20261112160310_add_user/migration.sql` | `prisma validate` 通过；`prisma migrate status` 显示已同步；`prisma generate` 成功 | 已移除 `roleCode`；`deptId` 暂为字符串，Department 表待补 |
| RBAC 数据模型与种子 | 已完成 | `Role`/`UserRole`/`User.deptId` 可迁移；15 角色、3 演示账号可重复 seed | `prisma/schema.prisma`、`prisma/migrations/20261112162003_*`、`shared/permissions.ts`、`prisma/seed.ts`、`package.json` | `prisma migrate status` 已同步；Role=15、User=3、UserRole=3；`db:seed` 可重复执行；`lint`/`typecheck` 通过 | 种子为 upsert，不删除手工数据；其余 12 个演示账号待补 |
| P1 业务数据模型 | 进行中 | 核心表可迁移，空库可重放 | `prisma/schema.prisma` | User/RBAC 迁移正常 | 其余业务表待开始 |
| P2 登录与会话 | 已完成 | 登录/退出/刷新保持，未登录跳转 | `server/api/auth/*`、`server/api/users/me.get.ts`、`app/pages/login.vue` | API 三接口验证通过；CDP 端到端验证登录、退出、刷新保持、未登录跳转 | 依赖 P1 用户表 |
| 前端登录接入与全局守卫 | 已完成 | 未登录跳登录；登录回原页；刷新保持；退出回登录 | `app/composables/useAuth.ts`、`app/middleware/auth.global.ts`、`app/utils/api-error.ts`、`app/pages/login.vue`、`app/pages/index.vue` | CDP 验证：`/` 未登录跳 `/login?redirect=/`；登录后回 `/`；刷新保持；退出回 `/login`；`lint`/`typecheck` 通过 | SSR 用 `useRequestFetch` 转发 Cookie；未登录页会产生预期 401 |
| 登录 API（sessions/me/logout） | 已完成 | 登录返回 201 + Cookie；错误密码 401；`users/me` 返回当前用户；退出返回 204 | `server/api/auth/sessions.post.ts`、`server/api/auth/sessions/current.delete.ts`、`server/api/users/me.get.ts`、`server/utils/auth.ts`、`shared/types/auth.ts` | 登录 201、角色/权限/范围正确；错误密码 401；`users/me` 200；退出 204；退出后 401；无 Cookie 401；`lint`/`typecheck` 通过 | JWT 只放 `userId`；Cookie `httpOnly + sameSite=lax`；前端未接 |
| 认证接口 RESTful 迁移 | 已完成 | 旧 `/api/auth/login|logout|me` 删除；新 `sessions`/`users/me` 生效 | `server/api/auth/*`、`server/api/users/me.get.ts`、`AGENTS.md`、详细版文档 | 新接口 201/200/204；旧接口均 404；`lint`/`typecheck` 通过 | 不保留旧路径别名 |
| P3 权限与数据范围 | 待开始 | 15 角色、菜单/按钮/接口、SELF/DEPT/ALL | `shared/permissions.ts`、`app/utils/menu.ts`、`server/utils/auth.ts` | — | 规则见主文档 2.3–2.8 |
| P4 款管理 | 待开始 | 列表/新建/详情 + 数据范围过滤 | `server/services/style.ts`、`app/pages/styles/*` | — | 依赖 P1/P3 |
| P5 流程实例化 | 待开始 | 4 套模板阶段数 9/9/7/6 | `shared/flow-templates.ts`、`server/services/flow.ts` | — | 依赖 P4 |
| P6 任务闭环 | 待开始 | 提交/评审/驳回/转派 + 阶段推进 | `server/services/flow.ts`、任务组件 | — | 核心功能 |
| 登录页 UI | 已完成 | `/login` 可访问；表单校验、演示账号弹窗选择/填充、提交登录、错误提示正常；右上角可切换 5 种主题色与浅色/深色/系统 | `app/pages/login.vue`、`app/components/ThemeSwitcher.vue`、`app/layouts/auth.vue`、`app/app.vue`、`app/app.config.ts`、`app/assets/css/main.css` | `pnpm lint`、`pnpm typecheck` 通过；CDP 验证登录跳转、主题切换、暗色、弹窗选择、校验 | 已接登录 API；主题色存 localStorage，刷新可能有一帧默认色 |

## 待处理事项

| 事项 | 优先级 | 说明 |
|---|---|---|
| `.env` 切回 `erp` 账号 | 高 | 当前 `.env` 使用 root/9527；应改为最小权限的 `erp`，root 只用于初始化 |
| 确认下一张核心表 | 高 | User/RBAC 已完成，Customer / Style / FlowTemplate 等下一张表待拍板 |
| 补齐其余演示账号 | 低 | 当前 seed 3 个账号，15 个角色已齐 |
| 补 `PROGRESS.md` 与文档的一致性检查 | 低 | 每个里程碑检查一次 |

## 决策记录

| 日期 | 决策 | 原因 |
|---|---|---|
| 2026-11-12 | 数据库只接入连接层，暂不建模型和 seed | 用户明确要求先只接入 |
| 2026-11-12 | 角色按“职责 + 级别”拆成 15 个，不用 level 字段 | 主管/专员动作不同，显式角色更可审计 |
| 2026-11-12 | 数据权限只做 `SELF / DEPT / ALL` 三档 | 组织树未稳定，避免过度设计 |
| 2026-11-12 | 权限码只描述动作，不拼数据范围 | 防止权限码爆炸，范围独立字段表达 |
| 2026-11-12 | Tailwind 4 通过 Nuxt UI 集成，不额外装 `@tailwindcss/vite` | 避免重复处理，官方推荐方式 |
| 2026-11-13 | `User` 表先只建 8 个字段，`roleCode` 用字符串 | 先跑通登录；Role/UserRole 等 P3 再加，避免过早关联（已被 2026-11-13 的 RBAC 决策取代） |
| 2026-11-13 | 采用 `Role` + `UserRole` + `User.deptId`，移除 `User.roleCode` | 支持兼岗多角色和 DEPT 数据范围；表为空，改造成本最低 |
| 2026-11-13 | JWT 只放 `userId`，角色/权限每次查库 | 角色变更即时生效，避免 token 过期前权限陈旧 |
| 2026-11-13 | 新接口遵循 RESTful：资源用复数名词，动作走子资源 | 统一 URL 和状态码，降低接口风格分叉 |
| 2026-11-13 | 认证接口资源化：`POST /api/auth/sessions`、`DELETE /api/auth/sessions/current`、`GET /api/users/me` | 移除动作路径，与 RESTful 规范一致 |
| 2026-11-13 | 前端当前用户存 `useState`，SSR 用 `useRequestFetch` 转发 Cookie | 刷新保持登录态，不引入 Pinia |

## 变更记录

### 2026-11-13

- 新增 `User` 模型并恢复缺失的 `migration.sql`（checksum 与 `_prisma_migrations` 记录一致）
- `prisma migrate status` 确认数据库已同步；重新生成 Prisma Client
- 为 `User` 每个字段补充中文备注
- 新增 `Role`、`UserRole`，`User` 增加 `deptId`、移除 `roleCode`
- 新增 `shared/permissions.ts`（15 个角色定义）与 `prisma/seed.ts`（3 个演示账号）
- 新增依赖 `bcryptjs`、`tsx`，并增加 `db:seed` 脚本
- 新增 `prisma/tsconfig.json` 与 `@types/node`，修复 seed 脚本中 `process` 的编辑器类型报错
- 为 `Role`、`UserRole` 的字段和关系补充中文备注
- 实现登录 API（初始路径 `/api/auth/login|logout|me`）
- 新增 `server/utils/auth.ts` 与 `shared/types/auth.ts`；新增依赖 `jose`、`zod`
- 本地 `.env` 增加 `JWT_SECRET`（未提交）；登录 API 已用 3 个演示账号验证
- 在 `AGENTS.md` 增加第 12 节 RESTful API 设计规范
- 认证接口迁移为 RESTful：`POST /api/auth/sessions`、`DELETE /api/auth/sessions/current`、`GET /api/users/me`；旧路径删除
- 新增 `docs/api/` 接口文档目录（按模块拆分）；更新 `README.md` 的接口文档入口、数据库命令与进度
- 新增 `app/composables/useAuth.ts`、`app/middleware/auth.global.ts`、`app/utils/api-error.ts`
- 登录页接入 `sessions` / `users/me` / `logout`；首页显示当前用户、角色、部门、数据范围与退出
- CDP 端到端验证：未登录跳登录、登录回原页、刷新保持、退出回登录

### 2026-11-12

- 建立 `AGENTS.md` 协作约定与 `PROGRESS.md` 进度看板
- 完成 MySQL 8 + Prisma 7 连接层与 `/api/health`
- 确认角色、菜单权限、数据权限规则（已写入主文档 2.3–2.8）
- 新增登录页 UI 预览：`/login`，含表单校验、演示账号填充、提交提示；未接登录接口
- `main.css` 增加 `@source "../../"`，确保 dev 下新增页面被 Tailwind 扫描
- 登录页改版：简洁双栏布局 + 右上角主题面板（5 种主题色、浅色/深色/系统）；补 `<NuxtLayout>` 修复布局警告
- 登录页按标注调整：移除左侧指标块，演示账号改为弹窗选择
