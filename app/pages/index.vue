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

const { user } = useAuth()
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">
          Dashboard
        </p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          概览
        </h2>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          欢迎回来，{{ user?.name }}。当前已打通登录、RBAC 基础数据与后台布局。
        </p>
      </div>

      <span class="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
        P2 已完成
      </span>
    </div>

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

    <h3 class="mt-10 text-sm font-semibold tracking-tight">
      技术栈
    </h3>
    <div class="mt-4 grid gap-4 sm:grid-cols-2">
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

    <div class="mt-8 rounded-xl bg-slate-900 p-6 text-slate-100 dark:bg-slate-800">
      <p class="text-sm font-semibold">
        开发进度
      </p>
      <p class="mt-2 text-sm text-slate-300">
        P0 完成 · User/RBAC 已建 · 登录 API 与登录页已通 · 下一步业务表
      </p>
    </div>
  </div>
</template>
