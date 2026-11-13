# 款管理

> 返回 [API 文档索引](./README.md)  
> 通用规则见 [conventions.md](./conventions.md)  
> 状态：**待实现**

---

## 1. 接口清单

| 方法 | 路径 | 说明 | 权限 |
|---|---|---|---|
| GET | `/api/styles` | 款列表（分页、筛选） | `style:read` |
| POST | `/api/styles` | 新建款 | `style:create` |
| GET | `/api/styles/:id` | 款详情 | `style:read` |
| PATCH | `/api/styles/:id` | 修改款 | `style:update` |
| GET | `/api/styles/:id/flow` | 流程、阶段与任务 | `style:read` |
| GET | `/api/styles/:id/changes` | 变更列表 | `order:read` |
| POST | `/api/styles/:id/changes` | 发起变更 | `order:change` |
| PATCH | `/api/styles/:id/status` | 暂停 / 恢复 / 取消 | `order:suspend` |

---

## 2. 列表参数

```http
GET /api/styles?page=1&pageSize=20&keyword=T恤&status=DEV&sourceLine=COMPANY
```

| 参数 | 说明 |
|---|---|
| `page` | 页码，默认 1 |
| `pageSize` | 每页数量，默认 20，最大 100 |
| `keyword` | 款号或款名搜索 |
| `status` | 款状态 |
| `sourceLine` | `COMPANY` / `CUSTOM_2` / `CUSTOM_3` / `REPEAT` |
| `designerId` | 设计师 |

返回格式见 [conventions.md](./conventions.md) 的分页约定。

---

## 3. 数据范围

- `SELF`：只返回本人相关的款
- `DEPT`：返回本部门的款
- `ALL`：返回全部
- 列表过滤之外，详情、修改、变更也要二次校验
- 数据范围外统一返回 404

---

## 4. 状态变更

暂停、恢复、取消统一走：

```http
PATCH /api/styles/:id/status
```

```json
{
  "status": "SUSPENDED"
}
```

| 状态 | 说明 |
|---|---|
| `SUSPENDED` | 暂停 |
| `RUNNING` | 恢复 |
| `CANCELLED` | 取消 |

实现时要求：

- 校验当前状态，非法流转返回 409
- 暂停后前端禁用任务操作，但不批量修改任务状态
- 取消后订单不可再操作
