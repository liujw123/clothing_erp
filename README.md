# 服装外贸 ERP

基于 Nuxt 4 全栈的服装外贸 ERP。

## 技术栈

- Nuxt 4（app/ 前端 + server/ 后端）
- Vue 3 + TypeScript
- Nuxt UI 4 + Tailwind CSS 4
- MySQL 8 + Prisma 7（driver adapter：`@prisma/adapter-mariadb`）
- JWT + RBAC（登录 API 已完成，权限中间件待接）

## 接口文档

见 [docs/api/README.md](./docs/api/README.md)。

## 开发

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm lint
pnpm typecheck
pnpm build
pnpm db:seed    # 只创建缺失角色；--reset-roles 恢复默认权限
```

> 新增页面后如果 Tailwind 样式缺失，重启 dev server 或修改 `app/assets/css/main.css` 触发重新扫描。

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
pnpm db:migrate    # 执行迁移
pnpm db:seed       # 只创建缺失角色，不覆盖已有角色权限
pnpm db:seed --reset-roles  # 恢复 15 个角色的默认权限与数据范围
pnpm db:studio     # Prisma Studio
```

连接验证：启动 `pnpm dev` 后访问 `http://localhost:3000/api/health`，返回 `{ code: 200, data: { ok: true, database: "mysql", latencyMs: ... }, message: "ok" }` 即接入成功。

当前已有 `User`、`Role`、`UserRole` 模型和演示数据；其余业务表待建。

## 目录

```text
app/      页面、组件、布局、样式
server/   Nitro API、Prisma Client（server/generated 自动生成）
prisma/   schema、迁移、seed
docs/api/ 接口文档（按模块拆分）
public/   静态资源
```

## 进度

- [x] P0 环境与脚手架（Nuxt 4 + Nuxt UI 4 + Tailwind CSS 4）
- [x] MySQL 8 + Prisma 7 连接层接入
- [x] User / Role / UserRole 模型与 seed
- [x] P2 登录 API（`sessions` / `users/me` / `logout`）
- [x] P2 前端登录接入与全局守卫
- [x] 后台布局（侧边栏 + 顶栏 + 内容区）
- [x] 统一 API 响应 `{ code, data, message }`
- [x] 个人中心（资料 / 密码修改）
- [x] 流程模板只读（4 套模板）
- [x] Customer 表与客户接口
- [x] 客户管理页面（列表 / 搜索 / 新建 / 编辑）
- [x] 权限底座（权限码 / 分组 / 通配符 / 数据范围工具）
- [x] Seed 默认不覆盖角色权限（`--reset-roles` 恢复默认）
- [x] 角色管理（新增/编辑、权限/数据范围/启停、备注、独立变更记录与审计）
- [x] 角色列表服务端分页、搜索与状态筛选
- [x] 后台界面统一优化（深色侧边栏、紧凑顶栏、PageHeader、列表工具栏与分页）
- [ ] P3 权限与布局
