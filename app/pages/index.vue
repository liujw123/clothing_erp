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
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-6 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <div class="mx-auto max-w-3xl">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Clothing ERP
      </p>
      <h1 class="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        服装外贸 ERP
      </h1>
      <p class="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400">
        项目骨架已就绪，MySQL 8 + Prisma 7 连接层已接入。下一步：业务数据模型。
      </p>

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
          P0 环境与骨架 ✅ · MySQL/Prisma 已接入 · 下一步业务模型
        </p>
      </div>
    </div>
  </main>
</template>
