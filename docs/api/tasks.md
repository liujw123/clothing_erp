# 任务

> 返回 [API 文档索引](./README.md)  
> 通用规则见 [conventions.md](./conventions.md)  
> 状态：**待实现**

---

## 1. 接口清单

| 方法 | 路径 | 说明 | 权限 |
|---|---|---|---|
| GET | `/api/tasks?assigneeId=me` | 我的任务 | 登录 |
| GET | `/api/tasks?styleId=:id` | 某个款的任务 | `style:read` |
| POST | `/api/tasks/:id/actions` | 任务动作 | 按 action 校验 |

---

## 2. 任务动作

```http
POST /api/tasks/:id/actions
```

**请求体**

```json
{
  "action": "submit",
  "formData": {},
  "comment": ""
}
```

| action | 说明 | 权限 | 额外字段 |
|---|---|---|---|
| `submit` | 提交任务 | `task:submit` + 是承办人 | `formData` |
| `approve` | 评审通过 | `task:approve` + 在 `reviewerRoles` 内 | `comment` |
| `reject` | 驳回 | `task:reject` + 在 `reviewerRoles` 内 | `comment` |
| `assign` | 转派 | `task:assign` | `assigneeId` |

**成功响应：200 OK**

返回更新后的任务 DTO，具体字段实现时补充。

**错误响应**

| 状态码 | 场景 |
|---|---|
| 400 | action 不合法、缺少必填字段 |
| 403 | 无权限、不是承办人、不在评审角色内 |
| 404 | 任务不存在，或数据范围外不可见 |
| 409 | 当前状态不允许该动作、重复提交 |

---

## 3. 状态约束

任务状态只有 4 个：

```text
TODO → SUBMITTED → APPROVED / REJECTED
```

- `submit` 只允许从 `TODO` 或 `REJECTED` 发起
- `approve` / `reject` 只允许从 `SUBMITTED` 发起
- 驳回后轮次 +1，可重新提交
- 阶段内所有任务通过后，才推进阶段并生成下一阶段任务
- 重复点击通过返回 409，不重复生成单据
