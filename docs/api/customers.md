# 客户

> 返回 [API 文档索引](./README.md)  
> 通用规则见 [conventions.md](./conventions.md)  
> 状态：**已实现**

客户是款的前置主数据。客户定开线与翻单必须关联客户，公司开发线创建时可为空。

> 前端页面：`/customers`。管理员/业务可维护，设计师只读；暂不提供删除。

**权限说明**

当前暂复用款权限：

- 查询：`style:read`
- 新建：`style:create`
- 修改：`style:update`

后续 P3 可拆分为 `customer:read/create/update`。客户属于公共主数据，不做 `SELF/DEPT` 数据范围。

---

## 1. 客户列表

```http
GET /api/customers?page=1&pageSize=20&keyword=欧美
```

**权限**：`style:read`

**查询参数**

| 参数 | 说明 |
|---|---|
| `page` | 页码，默认 1 |
| `pageSize` | 每页数量，默认 20，最大 100 |
| `keyword` | 按编码、名称、国家/地区模糊搜索 |

**成功响应：200 OK**

```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": "cm9x0v7q10000abc123def456",
        "code": "CUS-EU-001",
        "name": "欧美客户 A",
        "country": "美国",
        "createdAt": "2026-11-13T08:59:02.000Z",
        "updatedAt": "2026-11-13T08:59:02.000Z"
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 20
  },
  "message": "ok"
}
```

---

## 2. 客户详情

```http
GET /api/customers/:id
```

**权限**：`style:read`

**成功响应：200 OK**

`data` 为单个客户 DTO，结构同列表项。

**错误响应**

| 状态码 | 场景 | message 示例 |
|---|---|---|
| 400 | 缺少 ID | `缺少客户 ID` |
| 404 | 客户不存在 | `客户不存在` |

---

## 3. 新建客户

```http
POST /api/customers
```

**权限**：`style:create`

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `code` | string | 是 | 客户编码，服务端统一转大写 |
| `name` | string | 是 | 客户名称 |
| `country` | string \| null | 否 | 国家/地区 |

```json
{
  "code": "CUS-US-002",
  "name": "美国客户 B",
  "country": "美国"
}
```

**成功响应：201 Created**

```json
{
  "code": 201,
  "data": {
    "id": "cm9x0v7q10000abc123def456",
    "code": "CUS-US-002",
    "name": "美国客户 B",
    "country": "美国",
    "createdAt": "2026-11-13T09:00:00.000Z",
    "updatedAt": "2026-11-13T09:00:00.000Z"
  },
  "message": "ok"
}
```

**错误响应**

| 状态码 | 场景 | message 示例 |
|---|---|---|
| 400 | 编码/名称为空 | `请输入客户编码` / `请输入客户名称` |
| 409 | 客户编码已存在 | `客户编码已存在` |

---

## 4. 修改客户

```http
PATCH /api/customers/:id
```

**权限**：`style:update`

请求体同新建客户。

**成功响应：200 OK**

返回更新后的客户 DTO。

**错误响应**

| 状态码 | 场景 | message 示例 |
|---|---|---|
| 400 | 参数不合法 | `请输入客户名称` |
| 404 | 客户不存在 | `客户不存在` |
| 409 | 编码与其他客户重复 | `客户编码已存在` |

---

## 5. 客户 DTO

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 客户 ID，cuid |
| `code` | string | 客户编码，全局唯一，大写 |
| `name` | string | 客户名称 |
| `country` | string \| null | 国家/地区 |
| `createdAt` | string | 创建时间，ISO 8601 |
| `updatedAt` | string | 更新时间，ISO 8601 |

---

## 6. 说明

- 暂未提供删除接口，避免误删被款引用的客户
- 暂未加 `Style` 关系，等款管理接入后补 `customerId`
- 客户数据是公共主数据，列表不分页权限之外的部门范围
