# 角色

> 返回 [API 文档索引](./README.md)  
> 通用规则见 [conventions.md](./conventions.md)  
> 状态：**已实现（列表 + 新增 + 编辑）**

角色是权限包，包含权限码集合、数据范围和启用状态。角色编码稳定不变，名称、权限、数据范围、启用状态可由管理员修改；新增和修改都会在同一事务内写入 [审计记录](./audit-logs.md)。

**权限**：`admin:user`（当前仅管理员）

---

## 1. 角色列表

```http
GET /api/roles?page=1&pageSize=10&keyword=设计&status=active
```

**查询参数**

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `page` | number | `1` | 页码，从 1 开始 |
| `pageSize` | number | `10` | 每页条数，最大 100 |
| `keyword` | string | — | 按角色编码、名称、备注模糊匹配 |
| `status` | string | — | `active` 启用 / `inactive` 停用 |

**成功响应：200 OK**

```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "code": "ADMIN",
        "name": "总经理/管理员",
        "permissions": ["*"],
        "dataScope": "ALL",
        "active": true,
        "remark": null,
        "userCount": 1,
        "createdAt": "2026-11-13T08:17:06.000Z",
        "updatedAt": "2026-11-13T08:17:06.000Z"
      }
    ],
    "total": 15,
    "page": 1,
    "pageSize": 10
  },
  "message": "ok"
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `code` | string | 角色编码，稳定不变 |
| `name` | string | 角色名称 |
| `permissions` | string[] | 权限码数组；`*` 表示全部权限 |
| `dataScope` | string | `SELF` / `DEPT` / `ALL` |
| `active` | boolean | 是否启用 |
| `remark` | string \| null | 角色备注，最多 500 个字符 |
| `userCount` | number | 关联用户数（UserRole 记录数） |
| `createdAt` | string | 创建时间，ISO 8601 |
| `updatedAt` | string | 更新时间，ISO 8601 |

**排序与分页**

按 `ROLE_DEFINITIONS` 的顺序返回 15 个预置角色：管理员 → 设计 → 打版 → 核价 → 业务 → 跟单 → 品控 → 送货 → 财务。自定义角色排在最后，按创建时间升序；排序完成后按 `page` / `pageSize` 分页。

**错误响应**

| 状态码 | 场景 | message 示例 |
|---|---|---|
| 401 | 未登录 | `未登录` |
| 403 | 无 `admin:user` 权限 | `无权限` |

**PowerShell 示例**

```powershell
$roles = Invoke-RestMethod -Uri 'http://localhost:3000/api/roles?page=1&pageSize=10&status=active' -WebSession $session
$roles.data.items | Select-Object code, name, dataScope, remark, userCount
```

---

## 2. 新增角色

```http
POST /api/roles
```

创建自定义角色。角色编码由管理员手动输入，创建后不可修改；自定义角色排在预置角色之后。

**请求体**

```json
{
  "code": "CUSTOM_QC",
  "name": "质量主管",
  "permissions": ["style:read", "order:read"],
  "dataScope": "DEPT",
  "active": true,
  "remark": "负责成衣质量与验货"
}
```

| 字段 | 类型 | 约束 |
|---|---|---|
| `code` | string | 2–30 位；字母开头，只能包含字母、数字、下划线；服务端统一转大写；唯一且不能是 `ADMIN` |
| `name` | string | 1–50 个字符 |
| `permissions` | string[] | 至少一个；只能是 `PERMISSIONS` 中的权限码；不能包含 `*` |
| `dataScope` | string | `SELF` / `DEPT` / `ALL` |
| `active` | boolean | 可选，默认 `true` |
| `remark` | string \| null | 可选，最多 500 个字符 |

**成功响应：201 Created**

```json
{
  "code": 201,
  "data": {
    "code": "CUSTOM_QC",
    "name": "质量主管",
    "permissions": ["style:read", "order:read"],
    "dataScope": "DEPT",
    "active": true,
    "remark": "负责成衣质量与验货",
    "userCount": 0,
    "createdAt": "2026-11-14T08:45:44.000Z",
    "updatedAt": "2026-11-14T08:45:44.000Z"
  },
  "message": "ok"
}
```

**规则**

- `ADMIN` 为系统保留编码，不能新增
- 角色编码重复返回 409
- 非管理员不能创建带 `*` 的角色
- 创建成功写入 `CREATE_ROLE` 审计，`before` 为 `null`，`after` 为初始快照
- 角色创建与审计写入在同一事务，任一失败整体回滚

**错误响应**

| 状态码 | 场景 | message 示例 |
|---|---|---|
| 400 | 编码格式错误 | `角色编码需以字母开头，只能包含字母、数字和下划线` |
| 400 | 权限为空 | `角色至少保留一个权限` |
| 400 | 未知权限码 | `未知权限码：nope:read` |
| 400 | 非管理员带 `*` | `只有管理员角色可以拥有全部权限` |
| 401 | 未登录 | `未登录` |
| 403 | 无 `admin:user` 权限 | `无权限` |
| 409 | 编码重复 | `角色编码已存在` |
| 409 | 使用保留编码 | `ADMIN 为系统保留角色编码` |

**PowerShell 示例**

```powershell
$body = @{
  code = 'CUSTOM_QC'
  name = '质量主管'
  permissions = @('style:read', 'order:read')
  dataScope = 'DEPT'
  active = $true
  remark = '负责成衣质量与验货'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3000/api/roles' `
  -Method Post -ContentType 'application/json' -Body $body -WebSession $session
```

---

## 3. 修改角色

```http
PATCH /api/roles/:code
```

**路径参数**

| 参数 | 说明 |
|---|---|
| `code` | 角色编码，如 `DESIGNER`；只能包含大写字母、数字、下划线 |

**请求体**

所有字段可选，但至少传一个；未传字段保持原值。

```json
{
  "name": "设计师",
  "permissions": ["style:read", "task:submit"],
  "dataScope": "SELF",
  "active": true,
  "remark": "负责款式设计与任务提交"
}
```

| 字段 | 类型 | 约束 |
|---|---|---|
| `name` | string | 1–50 个字符 |
| `permissions` | string[] | 至少一个；只能是 `PERMISSIONS` 中的权限码 |
| `dataScope` | string | `SELF` / `DEPT` / `ALL` |
| `active` | boolean | 是否启用 |
| `remark` | string \| null | 最多 500 个字符；传空字符串或 `null` 表示清空 |

**成功响应：200 OK**

```json
{
  "code": 200,
  "data": {
    "code": "DESIGNER",
    "name": "设计师",
    "permissions": ["style:read", "task:submit"],
    "dataScope": "SELF",
    "active": true,
    "remark": "负责款式设计与任务提交",
    "userCount": 1,
    "createdAt": "2026-11-13T08:17:06.000Z",
    "updatedAt": "2026-11-14T08:30:00.000Z"
  },
  "message": "ok"
}
```

**保护规则**

| 规则 | 说明 |
|---|---|
| `ADMIN` 角色受保护 | 必须保留 `["*"]`、`ALL`、启用；只能改名称，否则返回 409 |
| 非管理员不能有 `*` | 防止普通角色获得全部权限，返回 400 |
| 至少保留一个权限 | 空数组返回 400 |
| 权限码白名单 | 未知权限码返回 400 |
| 无变化不写审计 | 提交内容与当前一致时返回当前角色，不产生空记录 |

**错误响应**

| 状态码 | 场景 | message 示例 |
|---|---|---|
| 400 | 参数格式错误 | `角色名称最多 50 个字符` |
| 400 | 空请求体 | `没有需要修改的字段` |
| 400 | 非管理员带 `*` | `只有管理员角色可以拥有全部权限` |
| 400 | 权限为空 | `角色至少保留一个权限` |
| 400 | 未知权限码 | `未知权限码：foo:bar` |
| 401 | 未登录 | `未登录` |
| 403 | 无 `admin:user` 权限 | `无权限` |
| 404 | 角色不存在 | `角色不存在` |
| 409 | 修改管理员受保护字段 | `管理员角色必须保留全部权限、全部数据范围且保持启用` |

**PowerShell 示例**

```powershell
$body = @{
  name = '设计师'
  permissions = @('style:read', 'task:submit', 'doc:read')
  dataScope = 'SELF'
  active = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3000/api/roles/DESIGNER' `
  -Method Patch -ContentType 'application/json' -Body $body -WebSession $session
```

---

## 4. 审计

新增或修改角色时，服务端在同一事务内写入一条 `AuditLog`：

| 场景 | `action` | `before` | `after` |
|---|---|---|---|
| 新增角色 | `CREATE_ROLE` | `null` | 初始快照 |
| 修改角色 | `UPDATE_ROLE` | 变更前快照 | 变更后快照 |

快照字段：

```json
{
  "name": "质量主管",
  "permissions": ["style:read", "order:read"],
  "dataScope": "DEPT",
  "active": true,
  "remark": "负责成衣质量与验货"
}
```

其他公共字段：

| 字段 | 值 |
|---|---|
| `entityType` | `ROLE` |
| `entityId` | 角色编码，如 `CUSTOM_QC` |
| `actorId` | 当前登录用户，取自服务端会话 |
| `ip` / `userAgent` | 请求 IP 与浏览器 UA |

角色写入失败时审计回滚；审计写入失败时角色写入回滚。审计查询见 [audit-logs.md](./audit-logs.md)。

---

## 5. 页面

页面 `/roles` 使用：

- 统一 `PageHeader`：标题、说明、右上角“新增角色”
- 工具栏：关键词搜索、状态筛选、查询、重置、刷新
- 角色列表：角色、数据范围、用户数、状态、备注；桌面使用表格，手机使用卡片列表；默认每页 10 条，可切换 10 / 20 / 50
- 表格底部显示总数、页码和上一页 / 下一页
- 点击角色行或“编辑”打开权限编辑弹窗，弹窗内不再包含变更记录页签
- 权限编辑弹窗：
  - 打开即进入编辑状态，自动回显名称、备注、权限、数据范围和启用状态
  - 按 `PERMISSION_GROUPS` 分组展示权限，勾选即修改
  - 点击“保存”后生效，成功/失败通过全局 toast 提示，不在弹窗内插入提示
- 每行“变更记录”打开独立弹窗，展示该角色的 `AuditLog`
  - 对比权限、数据范围、状态、名称和备注变化
  - 与权限编辑弹窗分开，不共用页签
- `ADMIN` 角色在页面和接口两层受保护，不可修改权限、范围、备注和启用状态

---

## 6. 后续扩展

暂未实现：

- 删除角色
- 给用户分配角色
- 角色复制
- 审计记录导出
