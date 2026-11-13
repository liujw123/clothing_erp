# 健康检查

> 返回 [API 文档索引](./README.md)

---

## 1. 检查数据库连接

```http
GET /api/health
```

**权限**：公开

**成功响应：200 OK**

```json
{
  "ok": true,
  "database": "mysql",
  "latencyMs": 2
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `ok` | boolean | 数据库连接是否正常 |
| `database` | string | 数据库类型 |
| `latencyMs` | number | 本次检查耗时，毫秒 |

**PowerShell 示例**

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/health'
```

**curl 示例**

```bash
curl http://localhost:3000/api/health
```

> 该接口是运维探针，不按资源命名规范建模。
