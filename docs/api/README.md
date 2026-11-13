# 服装外贸 ERP API 文档

> 版本：2026-11-13  
> Base URL：`http://localhost:3000/api`  
> 设计规范：[AGENTS.md 第 12 节](../../AGENTS.md)

---

## 1. 快速开始

```powershell
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$body = @{ email = 'admin@erp.local'; password = '123456' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/sessions' -Method Post -ContentType 'application/json' -Body $body -WebSession $session
Invoke-RestMethod -Uri 'http://localhost:3000/api/users/me' -WebSession $session
```

演示账号，密码统一为 `123456`：

| 邮箱 | 角色 | 部门 | 数据范围 |
|---|---|---|---|
| `admin@erp.local` | `ADMIN` | `MANAGEMENT` | `ALL` |
| `design.manager@erp.local` | `DESIGN_MANAGER` | `DESIGN` | `DEPT` |
| `designer@erp.local` | `DESIGNER` | `DESIGN` | `SELF` |

---

## 2. 模块索引

| 模块 | 文档 | 状态 |
|---|---|---|
| 通用约定 | [conventions.md](./conventions.md) | 规范 |
| 认证 / 会话 | [auth.md](./auth.md) | 已实现 |
| 用户 | [users.md](./users.md) | 已实现 `users/me` |
| 健康检查 | [health.md](./health.md) | 已实现 |
| 款管理 | [styles.md](./styles.md) | 待实现 |
| 任务 | [tasks.md](./tasks.md) | 待实现 |
| 订单 / 变更 | [orders.md](./orders.md) | 待实现 |
| 工作台 | [dashboard.md](./dashboard.md) | 待实现 |
| 变更记录 | [CHANGELOG.md](./CHANGELOG.md) | — |

---

## 3. 当前已实现接口

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/sessions` | 登录，返回 201 |
| DELETE | `/api/auth/sessions/current` | 退出，返回 204 |
| GET | `/api/users/me` | 当前用户，返回 200 |
| GET | `/api/health` | 健康检查，返回 200 |

业务接口（款、任务、订单、工作台）尚未实现，各模块文档已预留结构，状态标为“待实现”。

---

## 4. 文档维护约定

- 公共规则只写在 [conventions.md](./conventions.md)，模块文档不重复
- 每个模块只记录自己的请求、响应、权限和错误
- 接口实现后，把对应模块状态从“待实现”改为“已实现”
- 接口路径或行为变化时，同步更新 [CHANGELOG.md](./CHANGELOG.md)
