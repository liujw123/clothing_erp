<script setup lang="ts">
import { PERMISSIONS } from '#shared/permissions'

useHead({ title: '工作台' })

const { user, can } = useAuth()

const today = new Date().toLocaleDateString('zh-CN')

const roleNames = computed(() => {
  const names = user.value?.roles.map(role => role.name) ?? []
  return names.length > 0 ? names.join(' / ') : '未分配角色'
})

const scopeLabels: Record<string, string> = {
  SELF: '本人',
  DEPT: '本部门',
  ALL: '全部'
}

const deptLabels: Record<string, string> = {
  MANAGEMENT: '总经办',
  DESIGN: '设计部',
  SAMPLE: '打版部',
  COST: '核价部',
  SALES: '业务部',
  MERCHANDISING: '跟单部',
  QC: '品控部',
  WAREHOUSE: '仓储部',
  FINANCE: '财务部'
}

const overview = computed(() => [
  {
    label: '当前角色',
    value: roleNames.value,
    icon: 'i-lucide-shield-check'
  },
  {
    label: '数据范围',
    value: scopeLabels[user.value?.dataScope ?? 'SELF'] ?? '本人',
    icon: 'i-lucide-scan-eye'
  },
  {
    label: '所属部门',
    value: user.value?.deptId ? (deptLabels[user.value.deptId] ?? user.value.deptId) : '未设置',
    icon: 'i-lucide-building-2'
  },
  {
    label: '账号状态',
    value: '正常',
    icon: 'i-lucide-circle-check'
  }
])

const modules = computed(() => [
  { label: '客户档案', description: '客户列表、搜索、新建与编辑', to: '/customers', icon: 'i-lucide-building-2', permission: PERMISSIONS.STYLE_READ },
  { label: '角色权限', description: '角色新增、权限编辑与变更记录', to: '/roles', icon: 'i-lucide-shield-check', permission: PERMISSIONS.ADMIN_USER },
  { label: '流程模板', description: '4 套预设流程的阶段与任务配置', to: '/templates', icon: 'i-lucide-workflow', permission: PERMISSIONS.ADMIN_TEMPLATE }
].filter(item => can(item.permission)))
</script>

<template>
  <div class="w-full">
    <PageHeader
      title="工作台"
      :description="`欢迎回来，${user?.name ?? ''}。今天是 ${today}。`"
    >
      <template #actions>
        <span class="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          {{ user?.email }}
        </span>
      </template>
    </PageHeader>

    <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="item in overview"
        :key="item.label"
        class="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ item.label }}
            </p>
            <p class="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
              {{ item.value }}
            </p>
          </div>
          <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UIcon
              :name="item.icon"
              class="size-4"
            />
          </span>
        </div>
      </div>
    </div>

    <div class="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
      <section class="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div class="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white">
            常用模块
          </h2>
          <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            当前可用的业务与系统功能
          </p>
        </div>

        <div class="divide-y divide-slate-100 dark:divide-slate-800">
          <NuxtLink
            v-for="item in modules"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
          >
            <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <UIcon
                :name="item.icon"
                class="size-4"
              />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-[13px] font-medium text-slate-900 dark:text-white">{{ item.label }}</span>
              <span class="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">{{ item.description }}</span>
            </span>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4 shrink-0 text-slate-300 dark:text-slate-600"
            />
          </NuxtLink>
        </div>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-white">
          项目进度
        </h2>
        <div class="mt-3 space-y-3">
          <div class="flex items-start gap-2.5">
            <span class="mt-1 size-2 shrink-0 rounded-full bg-emerald-500" />
            <div>
              <p class="text-xs font-medium text-slate-700 dark:text-slate-200">
                P0–P2 已完成
              </p>
              <p class="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                脚手架、数据库、登录、RBAC、后台布局
              </p>
            </div>
          </div>
          <div class="flex items-start gap-2.5">
            <span class="mt-1 size-2 shrink-0 rounded-full bg-primary" />
            <div>
              <p class="text-xs font-medium text-slate-700 dark:text-slate-200">
                当前：P1 业务数据模型
              </p>
              <p class="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                客户、角色权限与流程模板已接入
              </p>
            </div>
          </div>
          <div class="flex items-start gap-2.5">
            <span class="mt-1 size-2 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
            <div>
              <p class="text-xs font-medium text-slate-700 dark:text-slate-200">
                下一步：P3 数据范围
              </p>
              <p class="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                把 SELF / DEPT / ALL 接入业务查询
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
