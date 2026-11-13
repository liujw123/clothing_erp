# API 变更记录

> 返回 [API 文档索引](./README.md)

## 2026-11-13

- 接口文档从根目录 `API.md` 拆分到 `docs/api/`，按模块维护
- 认证接口迁移为 RESTful：
  - `POST /api/auth/sessions`（登录，201）
  - `DELETE /api/auth/sessions/current`（退出，204）
  - `GET /api/users/me`（当前用户，200）
- 删除旧路径：
  - `/api/auth/login`
  - `/api/auth/logout`
  - `/api/auth/me`
- 新增健康检查文档
- 新增款、任务、订单、工作台模块文档，状态为“待实现”
