<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  subtitle?: string | null
  clickable?: boolean
  active?: boolean
}>(), {
  subtitle: null,
  clickable: false,
  active: false
})

const emit = defineEmits<{
  select: []
}>()

function handleClick() {
  if (props.clickable) {
    emit('select')
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.clickable) {
    return
  }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('select')
  }
}
</script>

<template>
  <div
    class="rounded-lg border bg-white p-4 transition dark:bg-slate-900"
    :class="[
      active
        ? 'border-primary/60 ring-1 ring-primary/20'
        : 'border-slate-200 dark:border-slate-800',
      clickable ? 'cursor-pointer hover:border-primary/40' : ''
    ]"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p
          v-if="subtitle"
          class="font-mono text-[10px] text-slate-400 dark:text-slate-500"
        >
          {{ subtitle }}
        </p>
        <h3 class="mt-1 truncate text-sm font-medium text-slate-900 dark:text-white">
          {{ title }}
        </h3>
      </div>

      <slot name="aside" />
    </div>

    <div class="mt-3">
      <slot />
    </div>

    <div
      v-if="$slots.footer"
      class="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
