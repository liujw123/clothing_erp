# 服装外贸 ERP

基于 Nuxt 4 全栈的服装外贸 ERP。

## 技术栈

- Nuxt 4（app/ 前端 + server/ 后端）
- Vue 3 + TypeScript
- Nuxt UI 4 + Tailwind CSS 4
- MySQL 8 + Prisma 7（driver adapter：`@prisma/adapter-mariadb`）
- JWT + RBAC（P2/P3 接入）

## 开发

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm lint
pnpm typecheck
pnpm build
```

## 数据库接入

本机 MySQL 8.0 已运行时，用 root 或 DBA 账号执行一次：

```sql
CREATE DATABASE IF NOT EXISTS clothing_erp
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'erp'@'localhost' IDENTIFIED BY 'erp123456';
CREATE USER IF NOT EXISTS 'erp'@'127.0.0.1' IDENTIFIED BY 'erp123456';

GRANT ALL PRIVILEGES ON clothing_erp.* TO 'erp'@'localhost';
GRANT ALL PRIVILEGES ON clothing_erp.* TO 'erp'@'127.0.0.1';
FLUSH PRIVILEGES;
```

复制环境变量并按需执行 Prisma 命令：

```bash
cp .env.example .env
pnpm db:generate   # 生成 Prisma Client
pnpm db:migrate    # 有模型后再执行迁移
pnpm db:studio     # Prisma Studio
```

连接验证：启动 `pnpm dev` 后访问 `http://localhost:3000/api/health`，返回 `{ ok: true, database: "mysql", latencyMs: ... }` 即接入成功。

> 当前只接入数据库连接层，尚未定义业务模型。模型与种子数据留到后续阶段。

## 目录

```text
app/      页面、组件、布局、样式
server/   Nitro API、Prisma Client（server/generated 自动生成）
prisma/   数据模型（当前为空）
public/   静态资源
```

## 进度

- [x] P0 环境与脚手架（Nuxt 4 + Nuxt UI 4 + Tailwind CSS 4）
- [x] MySQL 8 + Prisma 7 连接层接入
- [ ] 业务数据模型与 Seed
- [ ] P2 登录与会话
- [ ] P3 权限与布局
