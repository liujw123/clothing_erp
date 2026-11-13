# 通用约定

> 返回 [API 文档索引](./README.md)

---

## 1. 请求与响应

- 请求和响应统一使用 JSON，字符集 UTF-8
- 请求头：`Content-Type: application/json`
- 所有响应统一返回 `{ code, data, message }`
- 成功：`code` 与 HTTP 状态码一致（200/201），`data` 为 DTO，`message` 为 `ok`
- 失败：`data: null`，`message` 为可展示错误信息，`code` 为 4xx/5xx
- 时间字段使用 ISO 8601 字符串
- `Decimal` 金额在 API 边界转成字符串
- JSON 字段使用 camelCase，枚举值使用 `UPPER_SNAKE_CASE`

成功示例：

```json
{
  "code": 200,
  "data": {},
  "message": "ok"
}
```

> 开发环境不会再额外返回 `stack` 等调试字段；统一由 `defineApiHandler` 包装。

---

## 2. 状态码

| 状态码 | 含义 |
|---|---|
| 200 | 查询、更新、删除成功 |
| 201 | 创建成功（登录创建会话） |
| 400 | 参数格式或校验失败 |
| 401 | 未登录、登录过期、账号密码错误 |
| 403 | 已登录但无功能权限 |
| 404 | 资源不存在，或数据范围外不可见 |
| 409 | 状态冲突、重复提交、唯一键冲突 |
| 500 | 服务端异常 |

> 不使用 204：统一响应需要响应体，删除/退出返回 200 + `data: null`。

---

## 3. 认证方式

- 登录成功后，服务端通过 `Set-Cookie` 下发 `erp_token`
- 浏览器后续请求自动携带 Cookie
- Cookie 属性：

```text
erp_token=<JWT>
Path=/
Max-Age=604800
HttpOnly
SameSite=Lax
Secure（生产环境）
```

- JWT 只保存 `userId`，角色和权限每次请求从数据库读取
- 不使用 `Authorization: Bearer`，不把 token 返回给前端 JS
- 受保护接口未登录返回 `401`

---

## 4. 权限与数据范围

- 受保护接口必须校验登录态；需要权限码的再校验权限
- 无功能权限返回 `403`
- 数据范围外统一返回 `404`，避免泄露资源是否存在
- 数据范围优先级：`ALL > DEPT > SELF`
- 前端传来的角色、用户 ID、数据范围一律不可信

---

## 5. 分页、筛选、排序

业务列表接口统一：

```http
GET /api/styles?page=1&pageSize=20&keyword=T恤&status=DEV
```

| 参数 | 说明 |
|---|---|
| `page` | 页码，从 1 开始，默认 1 |
| `pageSize` | 每页数量，默认 20，最大 100 |
| `keyword` | 关键词搜索 |
| `sortBy` | 排序字段，必须白名单校验 |
| `sortOrder` | `asc` 或 `desc` |

响应：

```json
{
  "code": 200,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "pageSize": 20
  },
  "message": "ok"
}
```

---

## 6. 错误格式

```json
{
  "code": 400,
  "data": null,
  "message": "邮箱格式不正确"
}
```

- 成功和失败使用同一外层结构
- 错误时 `data` 固定为 `null`
- `message` 必须是可以直接展示给用户的中文信息
- 不返回数据库错误、SQL、堆栈
- 字段级错误需要时再扩展统一结构，不单独另起格式
- 未匹配的 `/api/*` 路径返回统一 404 结构

---

## 7. 资源命名

- 资源用复数名词，小写，多单词用 kebab-case
- URL 不出现动词
- 嵌套资源最多两层
- 业务动作优先建模为子资源

示例：

```text
GET    /api/styles
POST   /api/styles
GET    /api/styles/:id
PATCH  /api/styles/:id
DELETE /api/styles/:id
POST   /api/tasks/:id/actions
```
