# API 变更记录

> 返回 [API 文档索引](./README.md)

## 2026-11-13

- 统一 API 响应格式为 `{ code, data, message }`
  - 成功：`code` 与 HTTP 状态码一致，`data` 为 DTO，`message` 为 `ok`
  - 失败：`data: null`，`message` 为错误信息
- 退出接口从 204 改为 200 + `data: null`，不再使用 204
- 新增 `server/api/[...slug].ts`，未匹配的 API 路径返回统一 404 结构
- 新增个人中心接口：
  - `PATCH /api/users/me`：修改昵称、手机号、邮箱、性别
  - `PATCH /api/users/me/password`：校验旧密码后修改新密码
- `AuthUser` 增加 `phone`、`gender`、`createdAt` 字段
- 接口文档从根目录 `API.md` 拆分到 `docs/api/`，按模块维护
- 认证接口迁移为 RESTful：
  - `POST /api/auth/sessions`（登录，201）
  - `DELETE /api/auth/sessions/current`（退出，200 + `data: null`）
  - `GET /api/users/me`（当前用户，200）
- 删除旧路径：
  - `/api/auth/login`
  - `/api/auth/logout`
  - `/api/auth/me`
- 新增健康检查文档
- 新增款、任务、订单、工作台模块文档，状态为“待实现”
