# 流程模板

> 返回 [API 文档索引](./README.md)  
> 通用规则见 [conventions.md](./conventions.md)  
> 状态：**已实现（只读）**

流程模板是流程实例化的配置来源。当前只提供查询，不支持新增、编辑、删除。

---

## 1. 模板列表

```http
GET /api/flow-templates
```

**权限**：`admin:template`（当前仅管理员）

**成功响应：200 OK**

```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "code": "COMPANY",
        "name": "公司开发线",
        "config": {
          "stages": [
            {
              "code": "DESIGN",
              "name": "设计",
              "sort": 1,
              "tasks": [
                {
                  "type": "DESIGN_EFFECT",
                  "title": "效果图设计",
                  "roleCode": "DESIGNER",
                  "reviewerRoles": ["DESIGN_MANAGER", "ADMIN"]
                }
              ]
            }
          ]
        },
        "createdAt": "2026-11-13T08:17:06.000Z",
        "updatedAt": "2026-11-13T08:17:06.000Z"
      }
    ],
    "total": 4,
    "page": 1,
    "pageSize": 20
  },
  "message": "ok"
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|---|---|---|
| `code` | string | 模板编码：`COMPANY` / `CUSTOM_2` / `CUSTOM_3` / `REPEAT` |
| `name` | string | 模板名称 |
| `config.stages` | StageConfig[] | 阶段列表，按 `sort` 升序 |
| `stages[].code` | string | 阶段编码 |
| `stages[].name` | string | 阶段名称 |
| `stages[].sort` | number | 当前模板内的阶段顺序，从 1 开始连续 |
| `stages[].tasks` | StageTaskConfig[] | 阶段下的任务 |
| `tasks[].type` | string | 任务类型编码 |
| `tasks[].title` | string | 任务标题 |
| `tasks[].roleCode` | string | 承办角色 |
| `tasks[].reviewerRoles` | string[] | 评审角色 |

**PowerShell 示例**

```powershell
# 复用登录时的 $session（管理员账号）
$list = Invoke-RestMethod -Uri 'http://localhost:3000/api/flow-templates' -WebSession $session
$list.data.items | Select-Object code, name
```

---

## 2. 模板详情

```http
GET /api/flow-templates/:code
```

**权限**：`admin:template`

**成功响应：200 OK**

```json
{
  "code": 200,
  "data": {
    "code": "COMPANY",
    "name": "公司开发线",
    "config": {
      "stages": []
    },
    "createdAt": "2026-11-13T08:17:06.000Z",
    "updatedAt": "2026-11-13T08:17:06.000Z"
  },
  "message": "ok"
}
```

**错误响应**

| 状态码 | 场景 | message 示例 |
|---|---|---|
| 401 | 未登录 | `未登录` |
| 403 | 无 `admin:template` 权限 | `无权限` |
| 404 | 模板编码不存在 | `模板不存在` |

---

## 3. 内置模板

| 编码 | 名称 | 阶段数 | 阶段 |
|---|---|---|---|
| `COMPANY` | 公司开发线 | 9 | 设计 → 打版 → 核价 → 报价 → 订单 → 采购 → 质检 → 进出库 → 结算 |
| `CUSTOM_2` | 二线定开 | 9 | 同公司线 |
| `CUSTOM_3` | 三线定开 | 7 | 设计 → 报价 → 订单 → 采购 → 质检 → 进出库 → 结算 |
| `REPEAT` | 翻单 | 6 | 报价 → 订单 → 采购 → 质检 → 进出库 → 结算 |

模板配置在 `shared/flow-templates.ts`，由 `prisma/seed.ts` 写入数据库。

---

## 4. 说明

- 模板只读，页面不提供编辑入口
- 页面 `/templates`：桌面为左侧模板列表 + 右侧阶段详情；手机端使用模板卡片列表，点击卡片切换详情
- 非管理员菜单隐藏，直接请求接口返回 403
- 后续 P5 流程实例化会基于这些模板生成阶段和任务
