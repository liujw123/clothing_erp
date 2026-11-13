# 认证 / 会话

> 返回 [API 文档索引](./README.md)  
> 通用规则见 [conventions.md](./conventions.md)

当前用户接口在 [users.md](./users.md)。

> 所有响应统一为 `{ code, data, message }`，详见 [conventions.md](./conventions.md)。

---

## 1. 登录

创建当前会话。

```http
POST /api/auth/sessions
```

**权限**：公开

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `email` | string | 是 | 登录邮箱 |
| `password` | string | 是 | 密码，至少 6 位 |

```json
{
  "email": "admin@erp.local",
  "password": "123456"
}
```

**成功响应：201 Created**

```json
{
  "code": 201,
  "data": {
    "id": "cm9x0v7q10000abc123def456",
    "email": "admin@erp.local",
    "name": "系统管理员",
    "deptId": "MANAGEMENT",
    "roles": [
      {
        "code": "ADMIN",
        "name": "总经理/管理员",
        "dataScope": "ALL"
      }
    ],
    "permissions": ["*"],
    "dataScope": "ALL"
  },
  "message": "ok"
}
```

同时返回 `Set-Cookie: erp_token=...`。

**错误响应**

错误体统一为 `{ code, data: null, message }`。

| 状态码 | 场景 | message 示例 |
|---|---|---|
| 400 | 邮箱为空 | `请输入邮箱` |
| 400 | 邮箱格式错误 | `邮箱格式不正确` |
| 400 | 密码少于 6 位 | `密码至少 6 位` |
| 401 | 账号不存在、密码错误、账号禁用 | `账号或密码错误` |
| 500 | 生产环境未配置 `JWT_SECRET` | `服务端未配置 JWT_SECRET` |

**PowerShell 示例（推荐）**

```powershell
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$body = @{ email = 'admin@erp.local'; password = '123456' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/sessions' -Method Post -ContentType 'application/json' -Body $body -WebSession $session
```

**curl 示例（Git Bash / WSL）**

```bash
curl -i -c cookies.txt -X POST http://localhost:3000/api/auth/sessions -H "Content-Type: application/json" -d '{"email":"admin@erp.local","password":"123456"}'
```

> Windows PowerShell 直接使用 `curl.exe` 时，JSON 引号可能被改写；推荐使用上面的 `Invoke-RestMethod`。

---

## 2. 退出登录

删除当前会话 Cookie。接口幂等，无 Cookie 时也返回 200。

```http
DELETE /api/auth/sessions/current
```

**权限**：无需登录

**成功响应：200 OK**

```json
{
  "code": 200,
  "data": null,
  "message": "ok"
}
```

**PowerShell 示例**

```powershell
# 复用登录时的 $session
Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/sessions/current' -Method Delete -WebSession $session
```

**curl 示例（Git Bash / WSL）**

```bash
curl -b cookies.txt -X DELETE http://localhost:3000/api/auth/sessions/current
```

> 当前 JWT 为无状态会话，退出只清除 Cookie；已签发的 token 在过期前仍然有效。

---

## 3. 登录态恢复

前端刷新后调用：

```http
GET /api/users/me
```

详见 [users.md](./users.md)。
