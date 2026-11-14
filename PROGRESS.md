# 项目进度

> 规则见 `AGENTS.md`。每开始/完成一个功能都要更新本文件。
> 最近更新：2026-11-14

## 当前阶段

**P1 业务数据模型（进行中） / P2 登录与会话（已完成）**

- 已完成：P0 环境与脚手架、MySQL 8 + Prisma 7 连接层、`User` 表、RBAC 数据模型、15 角色 + 3 演示账号 seed、登录 API、登录页接入与全局守卫、后台布局、统一 API 响应、个人中心、流程模板只读、Customer 表与接口、客户管理页面、权限底座、Seed 角色策略、角色管理页（新增、权限编辑、备注、独立变更记录）、后台界面统一优化
- 下一步：P3 数据范围接入业务表；用户管理；审计查询筛选

## 功能进度

| 功能 | 状态 | 验收标准 | 涉及文件 | 验证结果 | 备注 |
|---|---|---|---|---|---|
| Nuxt 4 项目骨架 | 已完成 | 项目可启动，lint/typecheck 通过 | `nuxt.config.ts`、`app/` | `pnpm lint`、`pnpm typecheck` 通过 | 已清理 starter 模板内容 |
| Nuxt UI 4 + Tailwind CSS 4 | 已完成 | 页面样式生效 | `app/assets/css/main.css`、`app/app.vue` | 首页 Tailwind 样式正常 | 通过 Nuxt UI 集成 Tailwind 4 |
| MySQL 8 + Prisma 7 连接层 | 已完成 | `/api/health` 返回 `ok: true` | `prisma/`、`server/utils/db.ts`、`server/utils/prisma.ts`、`server/api/health.get.ts` | `{"ok":true,"database":"mysql","latencyMs":1}` | 仅连接层，无业务模型 |
| User 表 | 已完成 | `User` 模型可迁移，Prisma Client 可生成 | `prisma/schema.prisma`、`prisma/migrations/20261112160310_add_user/migration.sql` | `prisma validate` 通过；`prisma migrate status` 显示已同步；`prisma generate` 成功 | 已移除 `roleCode`；新增 `phone`、`gender`、`username`；`deptId` 暂为字符串，Department 表待补 |
| RBAC 数据模型与种子 | 已完成 | `Role`/`UserRole`/`User.deptId` 可迁移；15 角色、3 演示账号可重复 seed | `prisma/schema.prisma`、`prisma/migrations/20261112162003_*`、`shared/permissions.ts`、`prisma/seed.ts`、`package.json` | `prisma migrate status` 已同步；Role=15、User=3、UserRole=3；`db:seed` 可重复执行；`lint`/`typecheck` 通过 | 种子为 upsert，不删除手工数据；其余 12 个演示账号待补 |
| P1 业务数据模型 | 进行中 | 核心表可迁移，空库可重放 | `prisma/schema.prisma` | User/RBAC 迁移正常 | 其余业务表待开始 |
| P2 登录与会话 | 已完成 | 登录/退出/刷新保持，未登录跳转 | `server/api/auth/*`、`server/api/users/me.get.ts`、`app/pages/login.vue` | API 三接口验证通过；CDP 端到端验证登录、退出、刷新保持、未登录跳转 | 依赖 P1 用户表 |
| 前端登录接入与全局守卫 | 已完成 | 未登录跳登录；登录回原页；刷新保持；退出回登录 | `app/composables/useAuth.ts`、`app/middleware/auth.global.ts`、`app/utils/api-error.ts`、`app/pages/login.vue`、`app/pages/index.vue` | CDP 验证：`/` 未登录跳 `/login?redirect=/`；登录后回 `/`；刷新保持；退出回 `/login`；`lint`/`typecheck` 通过 | SSR 用 `useRequestFetch` 转发 Cookie；未登录页会产生预期 401 |
| 后台布局（侧边栏 + 顶栏 + 内容区） | 已完成 | 登录后显示左侧菜单、顶部栏、右侧内容区；移动端菜单可开合 | `app/layouts/default.vue`、`app/pages/index.vue` | CDP 验证桌面与 390px 移动端布局；菜单、用户菜单、退出正常；`lint`/`typecheck` 通过 | 未实现菜单项标记“待开发”；菜单权限过滤留到 P3 |
| 登录 API（sessions/me/logout） | 已完成 | 登录返回 201 + Cookie；错误密码 401；`users/me` 返回当前用户；退出返回 200 + `data: null` | `server/api/auth/sessions.post.ts`、`server/api/auth/sessions/current.delete.ts`、`server/api/users/me.get.ts`、`server/utils/auth.ts`、`shared/types/auth.ts` | 登录 201、角色/权限/范围正确；错误密码 401；`users/me` 200；退出 200 + null；退出后 401；无 Cookie 401；`lint`/`typecheck` 通过 | JWT 只放 `userId`；Cookie `httpOnly + sameSite=lax`；前端已接 |
| 认证接口 RESTful 迁移 | 已完成 | 旧 `/api/auth/login|logout|me` 删除；新 `sessions`/`users/me` 生效 | `server/api/auth/*`、`server/api/users/me.get.ts`、`AGENTS.md`、详细版文档 | 新接口 201/200/200；旧接口均 404；`lint`/`typecheck` 通过 | 不保留旧路径别名 |
| 统一 API 响应格式 | 已完成 | 所有接口返回 `{ code, data, message }`；失败 `data: null`；不使用 204 | `shared/types/api.ts`、`server/utils/response.ts`、`server/api/*`、`app/composables/useAuth.ts`、`app/utils/api-error.ts` | login 201、me 200、logout 200 + null、health 200；400/401/404 均带统一结构；`lint`/`typecheck` 通过 | `code` 与 HTTP 状态码一致；前端已解包 `data`；未知 API 路径由 catch-all 返回 404 |
| 权限底座 | 已完成 | 权限码集中、权限分组、通配符判断、多角色数据范围取最宽 | `shared/permissions.ts`、`server/utils/auth.ts`、`server/utils/scope.ts`、`app/composables/useAuth.ts`、`app/layouts/default.vue`、`server/api/*` | 15 角色无非法权限码；通配符/最宽范围验证通过；管理员/设计师 API 权限回归通过；`lint`/`typecheck`/seed typecheck 通过 | 角色/岗位/用户管理页未做；`DOC_READ` 暂未分配给角色；数据范围查询 helper 待业务表接入 |
| Seed 角色策略 | 已完成 | 默认只创建缺失角色，不覆盖已有角色权限；`--reset-roles` 恢复默认 | `prisma/seed.ts`、`README.md`、`AGENTS.md` | 手动改 DESIGNER 权限后默认 seed 不覆盖；`pnpm db:seed --reset-roles` 恢复 4 个权限；`lint`/`typecheck`/seed typecheck 通过 | 用户/模板/客户仍 upsert；默认模式角色完全不动 |
| 角色管理只读页 | 已完成 | 15 个角色、数据范围、关联用户数；点击角色弹窗查看权限矩阵；管理员可访问，非管理员 403 | `server/services/role.ts`、`server/api/roles/index.get.ts`、`app/pages/roles.vue`、`app/utils/menu.ts`、`app/layouts/default.vue`、`shared/types/role.ts` | API 返回 15 个角色，用户数合计 3；管理员列表 15 行，点击“设计师”弹窗显示权限详情；设计师菜单隐藏角色/订单/流程模板；`lint`/`typecheck`/seed typecheck 通过 | 只读阶段已交付，后续由“角色权限编辑与审计”扩展；`admin:user` 权限复用 |
| 角色权限编辑与审计 | 已完成 | `PATCH /api/roles/:code` 可改名称/备注/权限/数据范围/启停；审计与更新同事务；`ADMIN` 受保护；变更记录为独立弹窗；列表行内提供“变更记录”入口 | `prisma/schema.prisma`、`prisma/migrations/20261114082244_add_audit_log/`、`server/services/role.ts`、`server/services/audit.ts`、`server/api/roles/[code].patch.ts`、`server/api/audit-logs/index.get.ts`、`shared/types/audit.ts`、`shared/types/role.ts`、`app/pages/roles.vue`、`docs/api/roles.md`、`docs/api/audit-logs.md` | `PATCH SHIPPER` 200，权限/范围/备注更新成功；`ADMIN` 改范围 409；非管理员带 `*` 400；空权限 400；未知权限码 400；未知角色 404；设计师 PATCH/审计查询 403；审计快照包含备注；CDP 验证独立变更记录弹窗、保存、备注变化、`ADMIN` 只读；`lint`/`typecheck`/`build` 通过 | 测试产生的审计已清理，`SHIPPER` 已恢复；`ADMIN` 页面完全不可编辑，接口仅允许名称变化；审计暂无导出 |
| 角色备注字段 | 已完成 | `Role.remark` 可空、最多 500 字符；列表展示；新增/编辑可维护；审计快照包含备注 | `prisma/schema.prisma`、`prisma/migrations/20261114154951_add_role_remark/`、`shared/types/role.ts`、`server/services/role.ts`、`server/api/roles/index.post.ts`、`server/api/roles/[code].patch.ts`、`app/pages/roles.vue` | 迁移已应用；`PATCH SHIPPER { remark }` 200；`POST /api/roles` 带备注 201；审计 before/after 包含 `remark`；CDP 验证列表备注列、详情回显、保存、独立变更记录中的备注变化；`lint`/`typecheck`/`build` 通过 | 测试备注和角色已清理；备注为纯文本，不支持富文本 |
| 后台界面统一优化 | 已完成 | 深色侧边栏收窄、紧凑顶栏、全宽内容；角色/客户/模板/个人中心/工作台统一 `PageHeader`；桌面表格 + 手机卡片列表；分页统一 `ListPagination`；手机卡片统一 `MobileListCard`；下拉框统一 `select-control`；角色接口支持分页、搜索、状态筛选 | `app/layouts/default.vue`、`app/components/PageHeader.vue`、`app/components/ListPagination.vue`、`app/components/MobileListCard.vue`、`app/composables/useNotify.ts`、`app/pages/*`、`server/services/role.ts`、`server/api/roles/index.get.ts`、`docs/api/roles.md` | `GET /api/roles?page=2&pageSize=5` 返回第 2 页 5 条；`keyword=设计` 返回 2 条；`status=inactive` 返回 1 条；CDP 验证桌面表格撑满、手机角色 10 张卡片/客户 2 张卡片/模板 4 张卡片、模板点击切换详情、页面无横向溢出、操作文案和 select 箭头正常；`lint`/`typecheck`/`build` 通过 | 登录页保持原样；侧边栏按确认继续使用深色；角色排序仍在内存完成，角色数量增大后再下推数据库 |
| 新增角色 | 已完成 | `/roles` 提供“新增角色”按钮；管理员可填写编码/名称/权限/范围/启停；编码唯一且不可改；至少一个权限；创建与 `CREATE_ROLE` 审计同事务 | `server/services/role.ts`、`server/api/roles/index.post.ts`、`shared/types/audit.ts`、`app/pages/roles.vue`、`docs/api/roles.md`、`docs/api/audit-logs.md` | `POST /api/roles` 201，返回新角色；重复编码/`ADMIN` 409；非法编码/空权限/未知权限/`*` 400；设计师 403；审计 `CREATE_ROLE` 的 `before=null`、`after` 为初始快照；CDP 验证按钮、创建弹窗、创建成功提示、列表 17 行和变更记录；`lint`/`typecheck`/`build` 通过 | 测试角色 `QA_TEST`、`UI_TEST` 及审计已清理；暂无删除角色和修改编码 |
| 个人中心（资料/密码） | 已完成 | 用户菜单可进入个人中心；展示个人信息；修改昵称/手机号/邮箱/性别；修改密码；头像只读 | `app/pages/profile.vue`、`app/layouts/default.vue`、`server/api/users/me.patch.ts`、`server/api/users/me/password.patch.ts`、`shared/types/auth.ts`、`prisma/schema.prisma`、`prisma/seed.ts` | 资料/密码接口验证通过；重复邮箱 409、旧密码错误 400、新密码可登录；CDP 验证页面、保存、密码页签、移动端无溢出；密码字段均在 form 内，无 DOM 警告；`lint`/`typecheck` 通过 | 头像为昵称首字，不提供上传；部门编码在前端映射为中文名 |
| 流程模板只读 | 已完成 | 4 套模板可查询；阶段数 9/9/7/6；管理员菜单可见，非管理员 403；页面只读 | `shared/flow-templates.ts`、`prisma/schema.prisma`、`prisma/migrations/20261113081706_*`、`prisma/seed.ts`、`server/services/flow-template.ts`、`server/api/flow-templates/*`、`app/pages/templates.vue`、`app/layouts/default.vue` | API 返回 4 套模板，阶段数 9/9/7/6；管理员页面正常，设计师菜单隐藏且接口 403；`lint`/`typecheck` 通过 | 模板配置为 P5 实例化基础；只读，不支持编辑；非管理员直接访问显示“无权限” |
| Customer 表与接口 | 已完成 | 2 个演示客户；列表分页/关键词；详情、新建、修改；编码唯一 409 | `prisma/schema.prisma`、`prisma/migrations/20261113085902_*`、`prisma/seed.ts`、`server/services/customer.ts`、`server/api/customers/*` | seed 2 个客户；列表 200、搜索 1 条；新建 201、修改 200；重复编码 409；设计师可读、不可写（403）；未登录 401；`lint`/`typecheck`/seed typecheck 通过 | 暂不做页面和删除；权限暂复用 `style:read/create/update`，P3 再拆 `customer:*`；暂未加 Style 关系 |
| 客户管理页面 | 已完成 | 管理员可列表/搜索/分页/新建/编辑；设计师只读；空态/错误态正常 | `app/pages/customers.vue`、`app/layouts/default.vue` | CDP 验证：列表 2 条、创建/更新成功、搜索 1 条；设计师无新建/编辑按钮、显示只读；`lint`/`typecheck` 通过 | 权限复用 `style:*`；无删除和独立详情页 |
| P3 权限与数据范围 | 待开始 | 15 角色、菜单/按钮/接口、SELF/DEPT/ALL | `shared/permissions.ts`、`app/utils/menu.ts`、`server/utils/auth.ts` | — | 规则见主文档 2.3–2.8 |
| P4 款管理 | 待开始 | 列表/新建/详情 + 数据范围过滤 | `server/services/style.ts`、`app/pages/styles/*` | — | 依赖 P1/P3 |
| P5 流程实例化 | 待开始 | 4 套模板阶段数 9/9/7/6 | `shared/flow-templates.ts`、`server/services/flow.ts` | — | 依赖 P4 |
| P6 任务闭环 | 待开始 | 提交/评审/驳回/转派 + 阶段推进 | `server/services/flow.ts`、任务组件 | — | 核心功能 |
| 登录页 UI | 已完成 | `/login` 可访问；表单校验、演示账号弹窗选择/填充、提交登录、错误提示正常；右上角可切换 5 种主题色与浅色/深色/系统 | `app/pages/login.vue`、`app/components/ThemeSwitcher.vue`、`app/layouts/auth.vue`、`app/app.vue`、`app/app.config.ts`、`app/assets/css/main.css` | `pnpm lint`、`pnpm typecheck` 通过；CDP 验证登录跳转、主题切换、暗色、弹窗选择、校验 | 已接登录 API；主题色存 localStorage，刷新可能有一帧默认色 |

## 待处理事项

| 事项 | 优先级 | 说明 |
|---|---|---|
| `.env` 切回 `erp` 账号 | 高 | 当前 `.env` 使用 root/9527；应改为最小权限的 `erp`，root 只用于初始化 |
| 确认下一张核心表 | 高 | User/RBAC/FlowTemplate/Customer 已完成，Style / 订单等下一张表待拍板 |
| 补齐其余演示账号 | 低 | 当前 seed 3 个账号，15 个角色已齐 |
| 统一迁移文件表名大小写 | 中 | 本地 MySQL `lower_case_table_names=1`；迁移中 `user`/`User` 混用，部署到 Linux MySQL 前需验证空库重放 |
| 补 `PROGRESS.md` 与文档的一致性检查 | 低 | 每个里程碑检查一次 |

## 决策记录

| 日期 | 决策 | 原因 |
|---|---|---|
| 2026-11-12 | 数据库只接入连接层，暂不建模型和 seed | 用户明确要求先只接入 |
| 2026-11-12 | 角色按“职责 + 级别”拆成 15 个，不用 level 字段 | 主管/专员动作不同，显式角色更可审计 |
| 2026-11-12 | 数据权限只做 `SELF / DEPT / ALL` 三档 | 组织树未稳定，避免过度设计 |
| 2026-11-12 | 权限码只描述动作，不拼数据范围 | 防止权限码爆炸，范围独立字段表达 |
| 2026-11-12 | Tailwind 4 通过 Nuxt UI 集成，不额外装 `@tailwindcss/vite` | 避免重复处理，官方推荐方式 |
| 2026-11-13 | `User` 表先只建 8 个字段，`roleCode` 用字符串 | 先跑通登录；Role/UserRole 等 P3 再加，避免过早关联（已被 2026-11-13 的 RBAC 决策取代） |
| 2026-11-13 | 采用 `Role` + `UserRole` + `User.deptId`，移除 `User.roleCode` | 支持兼岗多角色和 DEPT 数据范围；表为空，改造成本最低 |
| 2026-11-13 | JWT 只放 `userId`，角色/权限每次查库 | 角色变更即时生效，避免 token 过期前权限陈旧 |
| 2026-11-13 | 新接口遵循 RESTful：资源用复数名词，动作走子资源 | 统一 URL 和状态码，降低接口风格分叉 |
| 2026-11-13 | 认证接口资源化：`POST /api/auth/sessions`、`DELETE /api/auth/sessions/current`、`GET /api/users/me` | 移除动作路径，与 RESTful 规范一致 |
| 2026-11-13 | 前端当前用户存 `useState`，SSR 用 `useRequestFetch` 转发 Cookie | 刷新保持登录态，不引入 Pinia |
| 2026-11-13 | API 统一 `{ code, data, message }`，`code` 与 HTTP 状态码一致，不使用 204 | 前后端统一处理成功/失败；204 无响应体，无法承载统一结构 |
| 2026-11-13 | 个人中心昵称复用 `User.name`，头像只读；新增 `phone` / `gender` / `username` | 不额外引入 nickname/avatar 字段；手机号和性别用于个人资料展示与编辑 |
| 2026-11-13 | 流程模板只读，不支持编辑；4 套模板由 seed 写入 | 模板是固定配置，先保证 P5 实例化有单一数据源 |
| 2026-11-13 | Customer 暂复用 `style:read/create/update` 权限 | 暂不扩权限矩阵；P3 再拆 `customer:*`，当前先把客户数据跑通 |
| 2026-11-13 | 权限码集中到 `PERMISSIONS`，`hasPermission` 统一通配符，`widestDataScope` 取最宽 | 避免页面/接口硬编码；角色、岗位、用户管理共用同一套规则 |
| 2026-11-14 | Seed 默认只创建缺失角色，`--reset-roles` 才恢复默认权限 | 角色管理后避免 seed 覆盖运行时配置 |
| 2026-11-14 | 角色页先只读，权限矩阵由 `PERMISSION_GROUPS` + `Role.permissions` 渲染 | 先确认权限模型，再开放编辑，避免误改管理员权限 |
| 2026-11-14 | 菜单可见性由动作权限推导，不单独建菜单权限表；角色页不展示推导结果 | 菜单与接口权限保持一致，避免两套权限模型 |
| 2026-11-14 | 新增通用 `AuditLog`，审计与业务更新同事务 | 用户/岗位变更可复用；任一步失败整体回滚，避免“改了没记录” |
| 2026-11-14 | `ADMIN` 角色页面只读，接口保护 `*` / `ALL` / 启用 | 防止误操作把管理员锁死；名称仍可在接口层单独修改 |
| 2026-11-14 | 无字段变化的 PATCH 不写审计 | 避免刷新或重复保存产生空记录；审计只记录真实变更 |
| 2026-11-14 | 新增角色编码由管理员手动输入，服务端统一转大写，创建后不可修改 | 角色编码是稳定标识；自动编号不利于和职责对应 |
| 2026-11-14 | 自定义角色排在 15 个预置角色之后，`ADMIN` 编码保留 | 保持既有角色顺序稳定；防止自定义角色占用系统编码 |
| 2026-11-14 | `Role` 增加可空 `remark`，最多 500 字符 | 角色需要业务备注；纯文本足够，避免富文本依赖 |
| 2026-11-14 | 变更记录改为独立弹窗，不再与权限编辑共用页签 | 权限编辑和审计查询用途不同，拆开后两个弹窗都更聚焦 |
| 2026-11-15 | 瞬时提示统一用全局 toast，不插入弹窗/表单内容区 | 避免提示出现/消失导致布局位移、滚动跳动和额外重渲染 |
| 2026-11-15 | toast 全局固定在左下角 | 避开弹窗底部“保存/关闭”和右上角关闭按钮，防止遮挡 |
| 2026-11-15 | 后台保留深色侧边栏，只优化宽度、层级、选中态和顶栏 | 按确认保留现有品牌风格，降低全站改版风险 |
| 2026-11-15 | 列表页统一 `PageHeader` + 工具栏 + 桌面表格 / 手机卡片 + `ListPagination` | 页面结构一致，减少大留白和重复标题 |
| 2026-11-15 | 手机端列表使用卡片，不再横向压缩表格 | 保证移动端可读性和操作按钮可点 |
| 2026-11-15 | 手机卡片和分页抽成 `MobileListCard` / `ListPagination` | 后续列表页直接复用，避免每个页面重复写布局和分页 |
| 2026-11-15 | 角色列表搜索/状态/分页放到 `GET /api/roles` | 页面不再一次加载全部角色；排序仍按预置顺序在内存完成 |

## 变更记录

### 2026-11-15

- 后台界面统一优化：深色侧边栏收窄、紧凑顶栏、内容全宽、统一 `PageHeader`
- 角色、客户、模板、个人中心、工作台统一列表/卡片/工具栏风格
- 角色列表支持关键词搜索、状态筛选、刷新、每页条数切换和服务端分页
- `GET /api/roles` 新增 `page`、`pageSize`、`keyword`、`status` 参数
- 客户列表增加每页条数切换；客户、个人中心提示改为全局 toast
- 角色表格和客户表格增加最小宽度，移动端改为横向滚动，避免文字竖排
- 列表表格改为撑满内容区，操作列补充“变更记录 / 编辑”文字
- 手机端角色 / 客户列表改为卡片布局，桌面端继续使用表格
- 手机端卡片抽成 `MobileListCard`，角色、客户、模板共用
- 流程模板手机端改为卡片选择 + 详情，桌面继续左侧列表
- 分页抽成 `ListPagination`，桌面和手机共用同一套翻页与每页条数
- 原生下拉框统一自定义箭头和右侧安全间距，避免箭头贴边
- 新增 `app/components/PageHeader.vue`、`app/composables/useNotify.ts`

### 2026-11-14

- 为 `PERMISSIONS` 的每个权限码补充中文备注，便于角色管理页和维护时阅读
- 调整 seed 角色策略：默认只创建缺失角色，不覆盖已有权限；新增 `pnpm db:seed --reset-roles`
- 新增 `GET /api/roles` 与 `/roles` 管理员只读页：角色、权限矩阵、数据范围、关联用户数
- 角色页改为列表 + 弹窗详情：权限矩阵不再平铺在表格里，点击角色查看
- 新增 `app/utils/menu.ts`，集中菜单配置；菜单可见性由权限码推导
- 角色弹窗增加“菜单可见性”；订单菜单改为按 `order:read` 过滤
- 新增 `AuditLog` 表与迁移 `20261114082244_add_audit_log`
- 新增 `PATCH /api/roles/:code`：名称、权限、数据范围、启用状态
- 角色修改与审计写入同事务；`ADMIN` 保护、非管理员禁用 `*`、至少保留一个权限
- 新增 `GET /api/audit-logs` 与 `docs/api/audit-logs.md`
- 角色弹窗新增编辑能力：打开即回显并可直接修改权限和“变更记录”页签
- 按需求移除角色弹窗和新增角色弹窗中的“菜单可见性”展示；菜单配置仍由布局使用
- 角色列表操作列新增“变更记录”入口，直接打开该角色的审计页签
- 新增 `POST /api/roles` 与“新增角色”按钮/创建弹窗
- 新增 `CREATE_ROLE` 审计；自定义角色编码手动输入、创建后不可改，`ADMIN` 保留
- 自定义角色排在预置角色之后，列表按创建时间稳定排序
- 新增 `Role.remark` 字段与迁移 `20261114154951_add_role_remark`
- 角色列表增加“备注”列；新增/编辑弹窗可维护备注
- 变更记录从角色弹窗拆成独立弹窗，通过列表“变更记录”按钮打开
- 审计快照扩展 `remark`，变更记录展示备注变化
- 角色保存/创建/校验提示改为全局 toast，移除弹窗内联成功/错误提示，减少重绘和布局位移
- toast 全局位置调整为左下角，避免遮挡弹窗底部“保存/关闭”和右上角关闭按钮
- 最后一个权限的复选框改为禁用，避免取消后状态与界面不一致

### 2026-11-13

- 新增 `User` 模型并恢复缺失的 `migration.sql`（checksum 与 `_prisma_migrations` 记录一致）
- `prisma migrate status` 确认数据库已同步；重新生成 Prisma Client
- 为 `User` 每个字段补充中文备注
- 新增 `Role`、`UserRole`，`User` 增加 `deptId`、移除 `roleCode`
- 新增 `shared/permissions.ts`（15 个角色定义）与 `prisma/seed.ts`（3 个演示账号）
- 新增依赖 `bcryptjs`、`tsx`，并增加 `db:seed` 脚本
- 新增 `prisma/tsconfig.json` 与 `@types/node`，修复 seed 脚本中 `process` 的编辑器类型报错
- 为 `Role`、`UserRole` 的字段和关系补充中文备注
- 实现登录 API（初始路径 `/api/auth/login|logout|me`）
- 新增 `server/utils/auth.ts` 与 `shared/types/auth.ts`；新增依赖 `jose`、`zod`
- 本地 `.env` 增加 `JWT_SECRET`（未提交）；登录 API 已用 3 个演示账号验证
- 在 `AGENTS.md` 增加第 12 节 RESTful API 设计规范
- 认证接口迁移为 RESTful：`POST /api/auth/sessions`、`DELETE /api/auth/sessions/current`、`GET /api/users/me`；旧路径删除
- 新增 `docs/api/` 接口文档目录（按模块拆分）；更新 `README.md` 的接口文档入口、数据库命令与进度
- 新增 `app/composables/useAuth.ts`、`app/middleware/auth.global.ts`、`app/utils/api-error.ts`
- 登录页接入 `sessions` / `users/me` / `logout`；首页显示当前用户、角色、部门、数据范围与退出
- CDP 端到端验证：未登录跳登录、登录回原页、刷新保持、退出回登录
- 新增 `app/layouts/default.vue`：左侧菜单 + 顶部栏 + 右侧内容区；首页改为内容页
- 新增 `defineApiHandler`，所有 API 统一返回 `{ code, data, message }`
- 前端 `useAuth` 解包 `data`，错误提示读取 `message`
- 同步更新 `AGENTS.md`、`docs/api/`、`README.md` 与详细版文档
- `User` 增加 `phone`、`gender`、`username`，恢复缺失的 profile/username 迁移文件
- 新增 `/profile` 个人中心，用户菜单加入“个人中心”
- 新增资料修改与密码修改接口；seed 补充手机号、性别、用户名
- 个人中心资料/密码表单改为 `<form>`，补齐 `autocomplete` 与隐藏 `username`，消除浏览器 DOM 警告
- 新增 `FlowTemplate` 表、4 套模板配置与 seed；新增只读 API `/api/flow-templates`
- 新增 `/templates` 管理员只读页面；侧边栏按 `admin:template` 显示/隐藏菜单
- 修复 `seed.ts` 中 `FlowTemplateConfig` 写入 Prisma `Json` 字段的类型错误
- 新增 `Customer` 表、2 个演示客户与客户列表/详情/新建/修改接口
- 客户接口暂复用 `style:read/create/update` 权限，P3 后再拆 `customer:*`
- 新增 `/customers` 客户管理页面：列表、搜索、分页、新建/编辑弹窗；设计师只读
- 完善权限底座：新增 `PERMISSIONS`、`PERMISSION_GROUPS`、`hasPermission`、`widestDataScope`、`isScopeAtLeast`、`canAccessTarget`
- 菜单、客户接口、流程模板接口改用权限常量；`useAuth.can()` 统一走 `hasPermission`
- 修复新增页面 Tailwind 未扫描问题：修改 `main.css` 触发重新扫描

### 2026-11-12

- 建立 `AGENTS.md` 协作约定与 `PROGRESS.md` 进度看板
- 完成 MySQL 8 + Prisma 7 连接层与 `/api/health`
- 确认角色、菜单权限、数据权限规则（已写入主文档 2.3–2.8）
- 新增登录页 UI 预览：`/login`，含表单校验、演示账号填充、提交提示；未接登录接口
- `main.css` 增加 `@source "../../"`，确保 dev 下新增页面被 Tailwind 扫描
- 登录页改版：简洁双栏布局 + 右上角主题面板（5 种主题色、浅色/深色/系统）；补 `<NuxtLayout>` 修复布局警告
- 登录页按标注调整：移除左侧指标块，演示账号改为弹窗选择
