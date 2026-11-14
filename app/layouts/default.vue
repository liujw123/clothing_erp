<script setup lang="ts">
import { MENU_GROUPS, MENU_ITEMS, isMenuVisible } from '~/utils/menu'

const route = useRoute()
const sidebarOpen = ref(false)
const userMenuOpen = ref(false)
const { user, logout } = useAuth()

const allMenuItems = MENU_ITEMS
const pageTitles: Record<string, string> = {
  '/profile': '个人中心'
}

const visibleMenuGroups = computed(() => MENU_GROUPS
  .map(group => ({
    ...group,
    items: group.items.filter(item => isMenuVisible(item, user.value?.permissions ?? []))
  }))
  .filter(group => group.items.length > 0)
)

const roleNames = computed(() => {
  const names = user.value?.roles.map(role => role.name) ?? []
  return names.length > 0 ? names.join(' / ') : '未分配角色'
})

const userInitial = computed(() => user.value?.name?.charAt(0) ?? '?')

const currentTitle = computed(() => {
  const item = allMenuItems.find(menuItem => isActivePath(menuItem.to))
  return item?.label ?? pageTitles[route.path] ?? '工作台'
})

function isActivePath(path: string) {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path === path || route.path.startsWith(`${path}/`)
}

function goProfile() {
  userMenuOpen.value = false
  navigateTo('/profile')
}

function handleLogout() {
  userMenuOpen.value = false
  logout()
}

watch(() => route.fullPath, () => {
  sidebarOpen.value = false
})
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
      @click="sidebarOpen = false"
    />

    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-slate-900 text-slate-100 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <NuxtLink
        to="/"
        class="flex h-14 shrink-0 items-center gap-2.5 border-b border-white/10 px-4"
      >
        <span class="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
          <UIcon
            name="i-lucide-shirt"
            class="size-4"
          />
        </span>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold tracking-tight">
            Clothing ERP
          </p>
          <p class="truncate text-[10px] text-slate-400">
            服装外贸全流程
          </p>
        </div>
      </NuxtLink>

      <nav class="flex-1 space-y-5 overflow-y-auto px-2 py-4">
        <div
          v-for="group in visibleMenuGroups"
          :key="group.label ?? 'main'"
        >
          <p
            v-if="group.label"
            class="px-3 pb-1.5 text-[10px] font-medium tracking-[0.16em] text-slate-500 uppercase"
          >
            {{ group.label }}
          </p>

          <div class="space-y-0.5">
            <template
              v-for="item in group.items"
              :key="item.to"
            >
              <NuxtLink
                v-if="!item.disabled"
                :to="item.to"
                class="relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition"
                :class="isActivePath(item.to)
                  ? 'bg-primary/15 font-medium text-primary before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-primary'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'"
              >
                <UIcon
                  :name="item.icon"
                  class="size-4 shrink-0"
                  :class="isActivePath(item.to) ? 'text-primary' : 'text-slate-400'"
                />
                <span class="flex-1">{{ item.label }}</span>
              </NuxtLink>

              <div
                v-else
                class="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-slate-500"
                aria-disabled="true"
                title="待开发"
              >
                <UIcon
                  :name="item.icon"
                  class="size-4 shrink-0"
                />
                <span class="flex-1">{{ item.label }}</span>
                <span class="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px]">
                  待开发
                </span>
              </div>
            </template>
          </div>
        </div>
      </nav>

      <div class="shrink-0 border-t border-white/10 px-4 py-3 text-[10px] text-slate-500">
        Clothing ERP · v0.1
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
        <div class="flex min-w-0 items-center gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-menu"
            aria-label="打开菜单"
            class="lg:hidden"
            @click="sidebarOpen = true"
          />

          <nav class="flex min-w-0 items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <NuxtLink
              to="/"
              class="shrink-0 transition hover:text-slate-700 dark:hover:text-slate-200"
            >
              首页
            </NuxtLink>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-3 shrink-0 text-slate-300 dark:text-slate-600"
            />
            <span class="truncate font-medium text-slate-700 dark:text-slate-200">
              {{ currentTitle }}
            </span>
          </nav>
        </div>

        <div class="flex items-center gap-0.5">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-bell"
            aria-label="通知"
            class="relative"
          >
            <span class="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />
          </UButton>

          <ThemeSwitcher />

          <span class="mx-1 hidden h-5 w-px bg-slate-200 sm:block dark:bg-slate-700" />

          <UPopover
            v-model:open="userMenuOpen"
            :content="{ align: 'end', sideOffset: 8 }"
          >
            <button
              type="button"
              class="flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span class="flex size-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                {{ userInitial }}
              </span>
              <span class="hidden text-left sm:block">
                <span class="block max-w-32 truncate text-xs font-medium">{{ user?.name }}</span>
                <span class="block max-w-32 truncate text-[10px] text-slate-500 dark:text-slate-400">{{ roleNames }}</span>
              </span>
              <UIcon
                name="i-lucide-chevron-down"
                class="size-3.5 text-slate-400"
              />
            </button>

            <template #content>
              <div class="w-56 p-2">
                <div class="px-2 py-1.5">
                  <p class="truncate text-sm font-medium">
                    {{ user?.name }}
                  </p>
                  <p class="truncate text-xs text-slate-500 dark:text-slate-400">
                    {{ user?.email }}
                  </p>
                </div>

                <div class="my-1 h-px bg-slate-200 dark:bg-slate-700" />

                <button
                  type="button"
                  class="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  @click="goProfile"
                >
                  <UIcon
                    name="i-lucide-user-round"
                    class="size-4"
                  />
                  个人中心
                </button>

                <button
                  type="button"
                  class="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  @click="handleLogout"
                >
                  <UIcon
                    name="i-lucide-log-out"
                    class="size-4"
                  />
                  退出登录
                </button>
              </div>
            </template>
          </UPopover>
        </div>
      </header>

      <main class="flex-1 px-4 py-5 sm:px-6 lg:px-8">
        <slot />
      </main>
    </div>
  </div>
</template>
