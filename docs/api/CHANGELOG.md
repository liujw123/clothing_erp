# API 变更记录

> 返回 [API 文档索引](./README.md)

## 2026-11-15

- 后台界面统一优化：
  - 深色侧边栏收窄并精简层级，顶栏只保留面包屑和用户操作
  - 角色、客户、模板、个人中心、工作台统一使用 `PageHeader`
  - 列表页统一工具栏、紧凑表格、状态标签和分页样式
  - 手机端角色 / 客户列表改为卡片布局，桌面端继续使用表格
  - 分页抽成 `ListPagination`，统一每页条数和翻页按钮
  - 手机端卡片抽成 `MobileListCard`，角色、客户、模板共用
  - 流程模板手机端改为卡片选择 + 详情，桌面继续左侧列表
  - 全局 toast 固定在左下角，不遮挡弹窗操作按钮
- `GET /api/roles` 支持分页、关键词和状态筛选：
  - `page` / `pageSize`（默认 10，最大 100）
  - `keyword`：角色编码、名称、备注模糊匹配
  - `status`：`active` / `inactive`
- 角色列表改为服务端分页，页面支持搜索、状态筛选、刷新和每页条数切换
- 客户列表增加每页条数切换；客户、个人中心提示改为全局 toast

## 2026-11-14

- 新增角色创建接口：
  - `POST /api/roles`：手动输入编码、名称、备注、权限、数据范围、启用状态
  - 编码统一转大写，创建后不可修改；`ADMIN` 为保留编码
  - 编码重复返回 409；权限至少一个；非管理员禁止 `*`
  - 创建成功写入 `CREATE_ROLE` 审计，`before` 为 `null`
- 新增角色编辑接口：
  - `PATCH /api/roles/:code`：修改名称、备注、权限、数据范围、启用状态
  - `ADMIN` 角色必须保留 `*`、`ALL`、启用
  - 非管理员角色禁止 `*`；角色至少保留一个权限
- `Role` 表新增 `remark` 字段与迁移 `20261114154951_add_role_remark`
- 新增通用审计表 `AuditLog` 与迁移 `20261114082244_add_audit_log`
- 角色新增/修改与审计写入放在同一事务，任一步失败整体回滚
- 新增审计查询接口：
  - `GET /api/audit-logs`：按实体类型、实体 ID、动作筛选，分页
- `/roles` 页面新增：
  - 顶部“新增角色”按钮和创建弹窗
  - 权限编辑弹窗打开即编辑，自动回显名称、备注、权限、数据范围、启用状态
  - 列表增加“备注”列
  - 变更记录改为独立弹窗，与权限编辑弹窗分开
  - 表格默认撑满内容区，操作列使用“变更记录 / 编辑”文字按钮
  - 保存、创建和校验提示改为全局 toast，不在弹窗内容区插入提示
- 新增 `docs/api/audit-logs.md`，更新角色接口文档与索引

## 2026-11-13

- 统一 API 响应格式为 `{ code, data, message }`
  - 成功：`code` 与 HTTP 状态码一致，`data` 为 DTO，`message` 为 `ok`
  - 失败：`data: null`，`message` 为错误信息
- 退出接口从 204 改为 200 + `data: null`，不再使用 204
- 新增 `server/api/[...slug].ts`，未匹配的 API 路径返回统一 404 结构
- 新增个人中心接口：
  - `PATCH /api/users/me`：修改昵称、手机号、邮箱、性别
  - `PATCH /api/users/me/password`：校验旧密码后修改新密码
- `AuthUser` 增加 `phone`、`gender`、`createdAt` 字段
- 新增流程模板只读接口：
  - `GET /api/flow-templates`
  - `GET /api/flow-templates/:code`
- 新增 4 套流程模板 seed 与 `/templates` 管理员只读页面
- 新增客户接口：
  - `GET /api/customers`
  - `GET /api/customers/:id`
  - `POST /api/customers`
  - `PATCH /api/customers/:id`
- `Customer` 表与 2 个演示客户 seed
- 新增角色只读接口与 `/roles` 页面：
  - `GET /api/roles`
  - 展示 15 个角色、权限矩阵、数据范围、关联用户数
- 接口文档从根目录 `API.md` 拆分到 `docs/api/`，按模块维护
- 认证接口迁移为 RESTful：
  - `POST /api/auth/sessions`（登录，201）
  - `DELETE /api/auth/sessions/current`（退出，200 + `data: null`）
  - `GET /api/users/me`（当前用户，200）
- 删除旧路径：
  - `/api/auth/login`
  - `/api/auth/logout`
  - `/api/auth/me`
- 新增健康检查文档
- 新增款、任务、订单、工作台模块文档，状态为“待实现”
