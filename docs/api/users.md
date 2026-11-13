# 用户

> 返回 [API 文档索引](./README.md)  
> 通用规则见 [conventions.md](./conventions.md)  
> 登录 / 退出见 [auth.md](./auth.md)

---

## 1. 获取当前用户

刷新页面或恢复登录态时调用。

```http
GET /api/users/me
```

**权限**：登录

**请求头**

```http
Cookie: erp_token=<JWT>
```

**成功响应：200 OK**

```json
{
  "code": 200,
  "data": {
    "id": "cm9x0v7q10000abc123def456",
    "email": "admin@erp.local",
    "name": "系统管理员",
    "phone": "15888888888",
    "gender": "FEMALE",
    "deptId": "MANAGEMENT",
    "roles": [
      {
        "code": "ADMIN",
        "name": "总经理/管理员",
        "dataScope": "ALL"
      }
    ],
    "permissions": ["*"],
    "dataScope": "ALL",
    "createdAt": "2026-11-12T16:21:30.399Z"
  },
  "message": "ok"
}
```

**错误响应**

错误体统一为 `{ code, data: null, message }`。

| 状态码 | 场景 | message 示例 |
|---|---|---|
| 401 | 未携带 Cookie | `未登录` |
| 401 | Token 无效或过期 | `登录已过期，请重新登录` |
| 401 | 用户不存在或已禁用 | `账号不可用` |

**PowerShell 示例**

```powershell
# 复用登录时的 $session
Invoke-RestMethod -Uri 'http://localhost:3000/api/users/me' -WebSession $session
```

**curl 示例（Git Bash / WSL）**

```bash
curl -b cookies.txt http://localhost:3000/api/users/me
```

---

## 2. 修改当前用户资料

```http
PATCH /api/users/me
```

**权限**：登录

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `name` | string | 是 | 用户昵称，最多 50 个字符 |
| `email` | string | 是 | 登录邮箱，不能与其他用户重复 |
| `phone` | string \| null | 否 | 手机号码 |
| `gender` | string \| null | 否 | `MALE` / `FEMALE` |

```json
{
  "name": "系统管理员",
  "email": "admin@erp.local",
  "phone": "15888888888",
  "gender": "FEMALE"
}
```

**成功响应：200 OK**

`data` 为更新后的 `AuthUser`，结构同获取当前用户。

**错误响应**

| 状态码 | 场景 | message 示例 |
|---|---|---|
| 400 | 昵称/邮箱/性别格式不正确 | `邮箱格式不正确` |
| 401 | 未登录 | `未登录` |
| 409 | 邮箱已被其他账号使用 | `邮箱已被使用` |

**PowerShell 示例**

```powershell
$body = @{
  name = '系统管理员'
  email = 'admin@erp.local'
  phone = '15888888888'
  gender = 'FEMALE'
} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/users/me' -Method Patch -ContentType 'application/json' -Body $body -WebSession $session
```

---

## 3. 修改密码

```http
PATCH /api/users/me/password
```

**权限**：登录

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `oldPassword` | string | 是 | 旧密码 |
| `newPassword` | string | 是 | 新密码，至少 6 位 |

```json
{
  "oldPassword": "123456",
  "newPassword": "1234567"
}
```

**成功响应：200 OK**

```json
{
  "code": 200,
  "data": null,
  "message": "ok"
}
```

**错误响应**

| 状态码 | 场景 | message 示例 |
|---|---|---|
| 400 | 旧密码为空 | `请输入旧密码` |
| 400 | 新密码少于 6 位 | `新密码至少 6 位` |
| 400 | 旧密码不正确 | `旧密码不正确` |
| 400 | 新旧密码相同 | `新密码不能与旧密码相同` |
| 401 | 未登录 | `未登录` |

**PowerShell 示例**

```powershell
$body = @{
  oldPassword = '123456'
  newPassword = '1234567'
} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/users/me/password' -Method Patch -ContentType 'application/json' -Body $body -WebSession $session
```

---

## 4. 用户 DTO

### 4.1 AuthUser

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 用户 ID，cuid |
| `email` | string | 登录邮箱 |
| `name` | string | 显示名称 |
| `phone` | string \| null | 手机号码 |
| `gender` | string \| null | `MALE` / `FEMALE` |
| `deptId` | string \| null | 部门编码，目前为字符串 |
| `roles` | AuthRole[] | 用户拥有的启用角色 |
| `permissions` | string[] | 多角色权限并集；管理员为 `["*"]` |
| `dataScope` | string | 多角色取最宽：`SELF` / `DEPT` / `ALL` |
| `createdAt` | string | 创建时间，ISO 8601 |

### 4.2 AuthRole

| 字段 | 类型 | 说明 |
|---|---|---|
| `code` | string | 角色编码，如 `ADMIN` / `DESIGNER` |
| `name` | string | 角色名称 |
| `dataScope` | string | 该角色的数据范围 |

### 4.3 数据范围优先级

```text
ALL > DEPT > SELF
```

用户有多个角色时，`dataScope` 取最宽的一档；`permissions` 取并集。

---

## 5. 用户管理（待实现）

| 方法 | 路径 | 说明 | 权限 |
|---|---|---|---|
| GET | `/api/users` | 用户列表（分页） | `admin:user` |
| POST | `/api/users` | 新建用户 | `admin:user` |
| GET | `/api/users/:id` | 用户详情 | `admin:user` |
| PATCH | `/api/users/:id` | 修改用户角色、部门、状态 | `admin:user` |

实现时补充：

- 新建用户返回 201
- 密码只接收明文入参，服务端 bcrypt 哈希后存储
- 列表和详情不返回 `password`
- 角色变更通过 `UserRole` 维护
