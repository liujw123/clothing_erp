<script setup lang="ts">
interface MenuItem {
  label: string
  to: string
  icon: string
  disabled?: boolean
  permission?: string
}

interface MenuGroup {
  label?: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    items: [
      { label: '工作台', to: '/', icon: 'i-lucide-layout-dashboard' }
    ]
  },
  {
    label: '业务',
    items: [
      { label: '客户管理', to: '/customers', icon: 'i-lucide-building-2', permission: 'style:read' },
      { label: '款管理', to: '/styles', icon: 'i-lucide-shirt', disabled: true },
      { label: '任务中心', to: '/tasks', icon: 'i-lucide-list-checks', disabled: true },
      { label: '订单管理', to: '/orders', icon: 'i-lucide-shopping-cart', disabled: true }
    ]
  },
  {
    label: '系统',
    items: [
      { label: '用户管理', to: '/users', icon: 'i-lucide-users', disabled: true, permission: 'admin:user' },
      { label: '流程模板', to: '/templates', icon: 'i-lucide-workflow', permission: 'admin:template' }
    ]
  }
]

const route = useRoute()
const sidebarOpen = ref(false)
const userMenuOpen = ref(false)
const { user, logout, can } = useAuth()

const allMenuItems = menuGroups.flatMap(group => group.items)
const pageTitles: Record<string, string> = {
  '/profile': '个人中心'
}

const visibleMenuGroups = computed(() => menuGroups
  .map(group => ({
    ...group,
    items: group.items.filter(item => !item.permission || can(item.permission))
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
      class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-slate-100 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <NuxtLink
        to="/"
        class="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5"
      >
        <span class="flex size-9 items-center justify-center rounded-xl bg-primary text-white">
          <UIcon
            name="i-lucide-shirt"
            class="size-5"
          />
        </span>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold">
            Clothing ERP
          </p>
          <p class="truncate text-[11px] text-slate-400">
            服装外贸全流程
          </p>
        </div>
      </NuxtLink>

      <nav class="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        <div
          v-for="group in visibleMenuGroups"
          :key="group.label ?? 'main'"
        >
          <p
            v-if="group.label"
            class="px-3 pb-2 text-[11px] font-medium tracking-wider text-slate-500 uppercase"
          >
            {{ group.label }}
          </p>

          <div class="space-y-1">
            <template
              v-for="item in group.items"
              :key="item.to"
            >
              <NuxtLink
                v-if="!item.disabled"
                :to="item.to"
                class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition"
                :class="isActivePath(item.to)
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'"
              >
                <UIcon
                  :name="item.icon"
                  class="size-4 shrink-0"
                />
                <span class="flex-1">{{ item.label }}</span>
              </NuxtLink>

              <div
                v-else
                class="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500"
                aria-disabled="true"
                title="待开发"
              >
                <UIcon
                  :name="item.icon"
                  class="size-4 shrink-0"
                />
                <span class="flex-1">{{ item.label }}</span>
                <span class="rounded-full bg-white/5 px-1.5 py-0.5 text-[10px]">
                  待开发
                </span>
              </div>
            </template>
          </div>
        </div>
      </nav>

      <div class="shrink-0 border-t border-white/10 px-5 py-4 text-[11px] text-slate-500">
        Clothing ERP · v0.1
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
        <div class="flex min-w-0 items-center gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-menu"
            aria-label="打开菜单"
            class="lg:hidden"
            @click="sidebarOpen = true"
          />

          <div class="min-w-0">
            <p class="truncate text-[11px] text-slate-400 dark:text-slate-500">
              <NuxtLink
                to="/"
                class="transition hover:text-slate-600 dark:hover:text-slate-300"
              >
                首页
              </NuxtLink>
              <span class="mx-1 text-slate-300 dark:text-slate-600">/</span>
              {{ currentTitle }}
            </p>
            <h1 class="truncate text-base font-semibold tracking-tight">
              {{ currentTitle }}
            </h1>
          </div>
        </div>

        <div class="flex items-center gap-1">
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

          <span class="mx-1 hidden h-6 w-px bg-slate-200 sm:block dark:bg-slate-700" />

          <UPopover
            v-model:open="userMenuOpen"
            :content="{ align: 'end', sideOffset: 8 }"
          >
            <button
              type="button"
              class="flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span class="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
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

      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
