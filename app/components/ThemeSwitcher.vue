<script setup lang="ts">
const appConfig = useAppConfig()
const colorMode = useColorMode()

const themeColors = [
  { label: '翡翠', value: 'emerald', hex: '#10b981' },
  { label: '海蓝', value: 'blue', hex: '#3b82f6' },
  { label: '靛紫', value: 'violet', hex: '#8b5cf6' },
  { label: '琥珀', value: 'amber', hex: '#f59e0b' },
  { label: '玫瑰', value: 'rose', hex: '#f43f5e' }
] as const

type ThemeColor = typeof themeColors[number]['value']

const modes = [
  { label: '浅色', value: 'light', icon: 'i-lucide-sun' },
  { label: '深色', value: 'dark', icon: 'i-lucide-moon' },
  { label: '系统', value: 'system', icon: 'i-lucide-monitor' }
] as const

const currentPrimary = computed(() => appConfig.ui.colors.primary)

function isThemeColor(value: string): value is ThemeColor {
  return themeColors.some(color => color.value === value)
}

function setPrimary(value: ThemeColor) {
  appConfig.ui.colors.primary = value
  localStorage.setItem('erp-primary', value)
}

function swatchClass(value: ThemeColor) {
  return currentPrimary.value === value
    ? 'ring-2 ring-slate-900 ring-offset-2 ring-offset-white dark:ring-white dark:ring-offset-slate-900'
    : 'ring-1 ring-slate-200 hover:scale-110 dark:ring-slate-700'
}

function modeClass(value: string) {
  return colorMode.preference === value
    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
}

onMounted(() => {
  const saved = localStorage.getItem('erp-primary')
  if (saved && isThemeColor(saved)) {
    appConfig.ui.colors.primary = saved
  }
})
</script>

<template>
  <UPopover :content="{ align: 'end', sideOffset: 8 }">
    <UButton
      color="neutral"
      variant="ghost"
      icon="i-lucide-palette"
      trailing-icon="i-lucide-chevron-down"
      aria-label="切换主题"
      class="rounded-full"
    />

    <template #content>
      <div class="w-64 p-4">
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
          主题色
        </p>
        <div class="mt-3 flex items-center gap-2.5">
          <button
            v-for="color in themeColors"
            :key="color.value"
            type="button"
            class="size-7 rounded-full transition"
            :class="swatchClass(color.value)"
            :style="{ backgroundColor: color.hex }"
            :aria-label="`主题色：${color.label}`"
            :title="color.label"
            @click="setPrimary(color.value)"
          />
        </div>

        <p class="mt-5 text-xs font-medium text-slate-500 dark:text-slate-400">
          外观
        </p>
        <div class="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            v-for="mode in modes"
            :key="mode.value"
            type="button"
            class="flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition"
            :class="modeClass(mode.value)"
            @click="colorMode.preference = mode.value"
          >
            <UIcon
              :name="mode.icon"
              class="size-3.5"
            />
            {{ mode.label }}
          </button>
        </div>
      </div>
    </template>
  </UPopover>
</template>
