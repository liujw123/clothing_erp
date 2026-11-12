# 项目进度

> 规则见 `AGENTS.md`。每开始/完成一个功能都要更新本文件。
> 最近更新：2026-11-12

## 当前阶段

**P1 业务数据模型（待开始）**

- 已完成：P0 环境与脚手架、MySQL 8 + Prisma 7 连接层
- 下一步：确认业务模型范围 → 建表 → 迁移 → 种子数据

## 功能进度

| 功能 | 状态 | 验收标准 | 涉及文件 | 验证结果 | 备注 |
|---|---|---|---|---|---|
| Nuxt 4 项目骨架 | 已完成 | 项目可启动，lint/typecheck 通过 | `nuxt.config.ts`、`app/` | `pnpm lint`、`pnpm typecheck` 通过 | 已清理 starter 模板内容 |
| Nuxt UI 4 + Tailwind CSS 4 | 已完成 | 页面样式生效 | `app/assets/css/main.css`、`app/app.vue` | 首页 Tailwind 样式正常 | 通过 Nuxt UI 集成 Tailwind 4 |
| MySQL 8 + Prisma 7 连接层 | 已完成 | `/api/health` 返回 `ok: true` | `prisma/`、`server/utils/db.ts`、`server/utils/prisma.ts`、`server/api/health.get.ts` | `{"ok":true,"database":"mysql","latencyMs":1}` | 仅连接层，无业务模型 |
| P1 业务数据模型 | 待开始 | 核心表可迁移，空库可重放 | `prisma/schema.prisma` | — | 需先确认模型范围 |
| P2 登录与会话 | 待开始 | 登录/退出/刷新保持，未登录跳转 | `server/api/auth/*`、`app/pages/login.vue` | — | 依赖 P1 用户表 |
| P3 权限与数据范围 | 待开始 | 15 角色、菜单/按钮/接口、SELF/DEPT/ALL | `shared/permissions.ts`、`app/utils/menu.ts`、`server/utils/auth.ts` | — | 规则见主文档 2.3–2.8 |
| P4 款管理 | 待开始 | 列表/新建/详情 + 数据范围过滤 | `server/services/style.ts`、`app/pages/styles/*` | — | 依赖 P1/P3 |
| P5 流程实例化 | 待开始 | 4 套模板阶段数 9/9/7/6 | `shared/flow-templates.ts`、`server/services/flow.ts` | — | 依赖 P4 |
| P6 任务闭环 | 待开始 | 提交/评审/驳回/转派 + 阶段推进 | `server/services/flow.ts`、任务组件 | — | 核心功能 |

## 待处理事项

| 事项 | 优先级 | 说明 |
|---|---|---|
| `.env` 切回 `erp` 账号 | 高 | 当前 `.env` 使用 root/9527；应改为最小权限的 `erp`，root 只用于初始化 |
| 确认 P1 模型范围 | 高 | 只做核心表还是先做最小闭环，需要拍板 |
| 初始化演示账号与种子数据 | 中 | 依赖 P1 模型 |
| 补 `PROGRESS.md` 与文档的一致性检查 | 低 | 每个里程碑检查一次 |

## 决策记录

| 日期 | 决策 | 原因 |
|---|---|---|
| 2026-11-12 | 数据库只接入连接层，暂不建模型和 seed | 用户明确要求先只接入 |
| 2026-11-12 | 角色按“职责 + 级别”拆成 15 个，不用 level 字段 | 主管/专员动作不同，显式角色更可审计 |
| 2026-11-12 | 数据权限只做 `SELF / DEPT / ALL` 三档 | 组织树未稳定，避免过度设计 |
| 2026-11-12 | 权限码只描述动作，不拼数据范围 | 防止权限码爆炸，范围独立字段表达 |
| 2026-11-12 | Tailwind 4 通过 Nuxt UI 集成，不额外装 `@tailwindcss/vite` | 避免重复处理，官方推荐方式 |

## 变更记录

### 2026-11-12

- 建立 `AGENTS.md` 协作约定与 `PROGRESS.md` 进度看板
- 完成 MySQL 8 + Prisma 7 连接层与 `/api/health`
- 确认角色、菜单权限、数据权限规则（已写入主文档 2.3–2.8）
