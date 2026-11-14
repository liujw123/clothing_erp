<script setup lang="ts">
defineProps<{
  total: number
  page: number
  totalPages: number
  pageSize: number
  hasPrev: boolean
  hasNext: boolean
}>()

const emit = defineEmits<{
  'change-page': [page: number]
  'change-page-size': [pageSize: number]
}>()

function onPageSizeChange(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value)
  if (!Number.isNaN(value)) {
    emit('change-page-size', value)
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
    <span>共 {{ total }} 条 · 第 {{ page }} / {{ totalPages }} 页</span>

    <div class="flex items-center gap-2">
      <select
        :value="pageSize"
        class="select-control h-8 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        @change="onPageSizeChange"
      >
        <option :value="10">
          10 条/页
        </option>
        <option :value="20">
          20 条/页
        </option>
        <option :value="50">
          50 条/页
        </option>
      </select>

      <UButton
        color="neutral"
        variant="outline"
        size="xs"
        label="上一页"
        :disabled="!hasPrev"
        @click="emit('change-page', page - 1)"
      />
      <UButton
        color="neutral"
        variant="outline"
        size="xs"
        label="下一页"
        :disabled="!hasNext"
        @click="emit('change-page', page + 1)"
      />
    </div>
  </div>
</template>
