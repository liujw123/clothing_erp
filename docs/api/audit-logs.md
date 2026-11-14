# 审计记录

> 返回 [API 文档索引](./README.md)  
> 通用规则见 [conventions.md](./conventions.md)  
> 状态：**已实现（只读）**

审计记录用于追踪敏感的管理操作，例如角色权限、数据范围的修改。记录只追加，不提供修改和删除接口。

当前写入场景：

| 场景 | action | entityType | before |
|---|---|---|---|
| 新增角色 | `CREATE_ROLE` | `ROLE` | `null` |
| 修改角色 | `UPDATE_ROLE` | `ROLE` | 变更前快照 |

**权限**：`admin:user`（当前仅管理员）

---

## 1. 审计列表

```http
GET /api/audit-logs?entityType=ROLE&entityId=DESIGNER&page=1&pageSize=20
```

**查询参数**

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `entityType` | string | — | 实体类型，如 `ROLE` |
| `entityId` | string | — | 实体 ID，如 `DESIGNER` |
| `action` | string | — | 动作，如 `UPDATE_ROLE` |
| `page` | number | `1` | 页码，从 1 开始 |
| `pageSize` | number | `20` | 每页条数，最大 100 |

**成功响应：200 OK**

```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": "cm3audit0001",
        "action": "UPDATE_ROLE",
        "entityType": "ROLE",
        "entityId": "DESIGNER",
        "before": {
          "name": "设计师",
          "permissions": ["style:read", "task:submit"],
          "dataScope": "SELF",
          "active": true,
          "remark": null
        },
        "after": {
          "name": "设计师",
          "permissions": ["style:read", "task:submit", "doc:read"],
          "dataScope": "SELF",
          "active": true,
          "remark": "负责款式设计与任务提交"
        },
        "comment": null,
        "ip": "::1",
        "userAgent": "Mozilla/5.0 ...",
        "createdAt": "2026-11-14T08:30:00.000Z",
        "actor": {
          "id": "cm3user0001",
          "name": "系统管理员",
          "email": "admin@erp.local"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  },
  "message": "ok"
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 审计记录 ID |
| `action` | string | 动作码，如 `UPDATE_ROLE` |
| `entityType` | string | 实体类型，如 `ROLE` |
| `entityId` | string | 实体 ID |
| `before` | object \| null | 变更前快照 |
| `after` | object \| null | 变更后快照 |
| `comment` | string \| null | 备注 |
| `ip` | string \| null | 请求 IP |
| `userAgent` | string \| null | 浏览器 UA |
| `createdAt` | string | 创建时间，ISO 8601 |
| `actor` | object | 操作人 `{ id, name, email }` |

**排序**

按 `createdAt` 倒序，最新的记录在前。

**错误响应**

| 状态码 | 场景 | message 示例 |
|---|---|---|
| 400 | 分页参数非法 | `pageSize 最大为 100` |
| 401 | 未登录 | `未登录` |
| 403 | 无 `admin:user` 权限 | `无权限` |

**PowerShell 示例**

```powershell
$logs = Invoke-RestMethod `
  -Uri 'http://localhost:3000/api/audit-logs?entityType=ROLE&entityId=DESIGNER' `
  -WebSession $session

$logs.data.items | Select-Object createdAt, action, entityId
```

---

## 2. 写入规则

- 审计与业务写入必须在同一 `prisma.$transaction` 内完成
- 新增角色时 `before` 为 `null`，`after` 为初始快照
- 操作人从服务端登录态获取，不接受前端传入的 `actorId`
- `before` / `after` 只保存必要字段，不保存密码、token、完整连接串
- `ip` 取 `getRequestIP(event, { xForwardedFor: true })`
- `userAgent` 取请求头，最长 512 字符
- 审计表只追加，不提供修改 / 删除接口
- 审计写入失败时，业务更新回滚，避免“改了但没记录”

角色修改的快照字段：

```json
{
  "name": "设计师",
  "permissions": ["style:read", "task:submit"],
  "dataScope": "SELF",
  "active": true,
  "remark": "负责款式设计与任务提交"
}
```

---

## 3. 页面

角色列表的“变更记录”按钮打开独立弹窗，读取：

```http
GET /api/audit-logs?entityType=ROLE&entityId=DESIGNER&page=1&pageSize=50
```

页面展示：

- 操作人、邮箱、操作时间
- 动作：`CREATE_ROLE` → “新增角色”，`UPDATE_ROLE` → “修改角色”
- 新增角色的初始名称、数据范围、启用状态、备注和权限
- 修改前后的名称、数据范围、启用状态和备注变化
- 新增 / 移除的权限
- 请求 IP

---

## 4. 后续扩展

- 用户、岗位变更复用同一张 `AuditLog`
- 按操作人、时间范围筛选
- 审计导出