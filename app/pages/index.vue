<script setup lang="ts">
import type { StageCode } from '#shared/types/domain'

useHead({ title: '工作台' })

interface StackItem {
  name: string
  desc: string
  stage?: StageCode
}

const stack: StackItem[] = [
  { name: 'Nuxt 4', desc: 'app/ 前端 + server/ 后端一体' },
  { name: 'Nuxt UI 4', desc: '组件库与设计系统' },
  { name: 'Tailwind CSS 4', desc: 'CSS-first 原子化样式' },
  { name: 'MySQL 8 + Prisma 7', desc: '数据存储与 ORM（已接入）' }
]

const { user, logout } = useAuth()

const roleNames = computed(() => {
  const names = user.value?.roles.map(role => role.name) ?? []
  return names.length > 0 ? names.join(' / ') : '未分配角色'
})
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-6 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <div class="mx-auto max-w-3xl">
      <header class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
            Clothing ERP
          </p>
          <h1 class="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            服装外贸 ERP
          </h1>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-right">
            <p class="text-sm font-medium">
              {{ user?.name }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ roleNames }}
            </p>
          </div>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-log-out"
            label="退出"
            @click="logout"
          />
        </div>
      </header>

      <p class="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400">
        登录成功。User / Role / UserRole 与登录 API 已接入，下一步：业务数据模型与流程内核。
      </p>

      <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm dark:border-slate-800 dark:bg-slate-900">
        <span>
          <span class="text-slate-500 dark:text-slate-400">邮箱：</span>{{ user?.email }}
        </span>
        <span>
          <span class="text-slate-500 dark:text-slate-400">部门：</span>{{ user?.deptId ?? '未设置' }}
        </span>
        <span>
          <span class="text-slate-500 dark:text-slate-400">数据范围：</span>{{ user?.dataScope }}
        </span>
      </div>

      <div class="mt-10 grid gap-4 sm:grid-cols-2">
        <div
          v-for="item in stack"
          :key="item.name"
          class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <p class="text-sm font-semibold">
            {{ item.name }}
          </p>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {{ item.desc }}
          </p>
        </div>
      </div>

      <div class="mt-10 rounded-xl bg-slate-900 p-6 text-slate-100 dark:bg-slate-800">
        <p class="text-sm font-semibold">
          开发进度
        </p>
        <p class="mt-2 text-sm text-slate-300">
          P0 完成 · User/RBAC 已建 · 登录 API 已通 · 下一步业务表
        </p>
      </div>
    </div>
  </main>
</template>
