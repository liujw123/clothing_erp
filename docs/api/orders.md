# 订单与变更

> 返回 [API 文档索引](./README.md)  
> 通用规则见 [conventions.md](./conventions.md)  
> 状态：**待实现**

---

## 1. 订单接口

| 方法 | 路径 | 说明 | 权限 |
|---|---|---|---|
| GET | `/api/orders` | 订单列表（分页） | `order:read` |
| POST | `/api/orders` | 创建订单 | `order:create` |
| GET | `/api/orders/:id` | 订单详情 | `order:read` |

约定：

- 本期一个款对应一个订单
- 报价通过后生成订单
- 订单金额使用字符串返回，避免 `Decimal` 精度问题
- 订单状态变更不直接写库，走对应业务动作

---

## 2. 变更接口

| 方法 | 路径 | 说明 | 权限 |
|---|---|---|---|
| GET | `/api/styles/:id/changes` | 变更列表 | `order:read` |
| POST | `/api/styles/:id/changes` | 发起变更 | `order:change` |
| POST | `/api/order-changes/:id/actions` | 审批变更 | `order:change` |

发起变更请求示例：

```json
{
  "changeType": "MATERIAL",
  "before": {},
  "after": {},
  "impactNote": "面料调整，交期顺延 3 天"
}
```

`changeType`：`MATERIAL` / `QTY` / `DELIVERY` / `PRICE`。

审批请求示例：

```json
{
  "action": "approve",
  "comment": "同意"
}
```

`action`：`approve` / `reject`。

变更通过后：

- 保存变更前后快照
- 款版本 +1
- 页面显示 V2，可对比
