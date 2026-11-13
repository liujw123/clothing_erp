<script setup lang="ts">
import type { ApiResponse } from '#shared/types/api'
import type { FlowTemplateDto } from '#shared/flow-templates'
import { ROLE_DEFINITIONS } from '#shared/permissions'

useHead({ title: '流程模板' })

interface FlowTemplateList {
  items: FlowTemplateDto[]
  total: number
  page: number
  pageSize: number
}

const requestFetch = useRequestFetch()
const { data, pending, error, refresh } = await useAsyncData('flow-templates', () =>
  requestFetch<ApiResponse<FlowTemplateList>>('/api/flow-templates')
)

const templates = computed(() => data.value?.data.items ?? [])
const selectedCode = ref('')

watchEffect(() => {
  if (!selectedCode.value && templates.value.length > 0) {
    selectedCode.value = templates.value[0]?.code ?? ''
  }
})

const selectedTemplate = computed(() =>
  templates.value.find(template => template.code === selectedCode.value) ?? templates.value[0]
)

const roleNames = Object.fromEntries(ROLE_DEFINITIONS.map(role => [role.code, role.name]))

const errorMessage = computed(() => {
  if (!error.value) {
    return ''
  }
  return getApiErrorMessage(error.value, '加载流程模板失败')
})

function roleLabel(code: string) {
  return roleNames[code] ?? code
}
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">
          Flow Templates
        </p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight">
          流程模板
        </h2>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          4 套预设流程，展示阶段与任务配置，仅供查看。
        </p>
      </div>

      <span class="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
        只读 · 管理员
      </span>
    </div>

    <div
      v-if="pending"
      class="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="mx-auto size-6 animate-spin text-primary"
      />
      <p class="mt-3">
        正在加载流程模板…
      </p>
    </div>

    <UAlert
      v-else-if="error"
      class="mt-8"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="errorMessage"
    >
      <template #description>
        <UButton
          color="error"
          variant="link"
          label="重新加载"
          @click="refresh()"
        />
      </template>
    </UAlert>

    <div
      v-else-if="templates.length === 0"
      class="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
    >
      暂无流程模板
    </div>

    <div
      v-else
      class="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]"
    >
      <section class="min-w-0 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <p class="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          模板列表
        </p>

        <div class="space-y-1">
          <button
            v-for="template in templates"
            :key="template.code"
            type="button"
            class="w-full rounded-xl px-3 py-3 text-left transition"
            :class="selectedTemplate?.code === template.code
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'"
            @click="selectedCode = template.code"
          >
            <span class="flex items-center justify-between gap-2">
              <span class="text-sm font-medium">{{ template.name }}</span>
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {{ template.config.stages.length }} 段
              </span>
            </span>
            <span class="mt-1 block text-[11px] text-slate-400 dark:text-slate-500">
              {{ template.code }}
            </span>
          </button>
        </div>
      </section>

      <section
        v-if="selectedTemplate"
        class="min-w-0 space-y-4"
      >
        <div class="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-xs font-medium tracking-wider text-slate-400 uppercase dark:text-slate-500">
                {{ selectedTemplate.code }}
              </p>
              <h3 class="mt-1 text-xl font-semibold tracking-tight">
                {{ selectedTemplate.name }}
              </h3>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                共 {{ selectedTemplate.config.stages.length }} 个阶段
              </p>
            </div>
            <span class="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              只读
            </span>
          </div>

          <div class="mt-5 flex flex-wrap items-center gap-2">
            <template
              v-for="(stage, index) in selectedTemplate.config.stages"
              :key="stage.code"
            >
              <span class="flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
                <span class="text-slate-400 dark:text-slate-500">{{ stage.sort }}</span>
                {{ stage.name }}
              </span>
              <UIcon
                v-if="index < selectedTemplate.config.stages.length - 1"
                name="i-lucide-chevron-right"
                class="size-3.5 text-slate-300 dark:text-slate-600"
              />
            </template>
          </div>
        </div>

        <div
          v-for="stage in selectedTemplate.config.stages"
          :key="stage.code"
          class="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        >
          <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3 dark:border-slate-800">
            <div class="flex items-center gap-3">
              <span class="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {{ stage.sort }}
              </span>
              <h4 class="text-sm font-semibold">
                {{ stage.name }}
              </h4>
            </div>
            <span class="text-xs text-slate-500 dark:text-slate-400">
              {{ stage.tasks.length }} 个任务
            </span>
          </div>

          <div class="divide-y divide-slate-100 dark:divide-slate-800">
            <div
              v-for="task in stage.tasks"
              :key="task.type"
              class="px-5 py-3"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="text-sm font-medium">
                  {{ task.title }}
                </p>
                <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {{ task.type }}
                </span>
              </div>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                承办：{{ roleLabel(task.roleCode) }} · 评审：{{ task.reviewerRoles.map(roleLabel).join(' / ') }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
