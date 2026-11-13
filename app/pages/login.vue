<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

useHead({ title: '登录' })

interface DemoAccount {
  role: string
  email: string
  desc: string
}

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive<{ email?: string, password?: string }>({})
const loading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const demoModalOpen = ref(false)
const route = useRoute()
const { login } = useAuth()

const demoAccounts: DemoAccount[] = [
  { role: '管理员', email: 'admin@erp.local', desc: '全部菜单与数据' },
  { role: '设计主管', email: 'design.manager@erp.local', desc: '本部门款与评审' },
  { role: '设计师', email: 'designer@erp.local', desc: '本人任务与提交' }
]

const stages = ['设计', '打版', '核价', '报价', '订单', '采购', '质检', '结算']

const year = new Date().getFullYear()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate() {
  errors.email = undefined
  errors.password = undefined

  const email = form.email.trim()
  if (!email) {
    errors.email = '请输入邮箱'
  } else if (!emailPattern.test(email)) {
    errors.email = '邮箱格式不正确'
  }

  if (!form.password) {
    errors.password = '请输入密码'
  } else if (form.password.length < 6) {
    errors.password = '密码至少 6 位'
  }

  return !errors.email && !errors.password
}

function fillDemo(email: string) {
  form.email = email
  form.password = '123456'
  errors.email = undefined
  errors.password = undefined
  errorMessage.value = ''
}

function selectDemo(account: DemoAccount) {
  fillDemo(account.email)
  demoModalOpen.value = false
}

function safeRedirect(value: unknown) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return '/'
  }
  return value
}

async function handleSubmit() {
  errorMessage.value = ''
  if (!validate()) {
    return
  }

  loading.value = true
  try {
    await login(form.email.trim(), form.password)
    await navigateTo(safeRedirect(route.query.redirect))
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, '登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative flex min-h-screen flex-col overflow-hidden">
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute -top-48 left-1/2 size-[38rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div class="absolute -right-40 bottom-0 size-[30rem] rounded-full bg-primary/5 blur-3xl" />
    </div>

    <header class="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <div class="flex items-center gap-3">
        <span class="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
          <UIcon
            name="i-lucide-shirt"
            class="size-5"
          />
        </span>
        <div>
          <p class="text-sm font-semibold tracking-tight">
            Clothing ERP
          </p>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">
            服装外贸全流程
          </p>
        </div>
      </div>

      <ThemeSwitcher />
    </header>

    <main class="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:pb-24">
      <section class="hidden lg:block">
        <div class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <span class="size-1.5 rounded-full bg-primary" />
          设计 → 结算，一条流程贯穿
        </div>

        <h1 class="mt-6 max-w-xl text-4xl leading-[1.1] font-semibold tracking-tight text-balance text-slate-900 xl:text-5xl dark:text-white">
          让每一个款，
          <br>
          <span class="text-primary">按流程</span>走到成交。
        </h1>

        <p class="mt-6 max-w-lg text-base leading-8 text-slate-500 dark:text-slate-400">
          从设计、打版、核价到报价、订单、采购、质检与结算，阶段和任务按模板自动生成，进度一目了然。
        </p>

        <div class="mt-12 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-slate-400 dark:text-slate-500">
          <template
            v-for="(stage, index) in stages"
            :key="stage"
          >
            <span>{{ stage }}</span>
            <span
              v-if="index < stages.length - 1"
              class="text-slate-300 dark:text-slate-700"
            >/</span>
          </template>
        </div>
      </section>

      <section class="mx-auto w-full max-w-md">
        <div class="rounded-3xl border border-slate-200/80 bg-white/90 p-7 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:p-9 dark:border-slate-800 dark:bg-slate-900/90">
          <div>
            <h2 class="text-2xl font-semibold tracking-tight">
              登录
            </h2>
            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
              使用内部账号进入工作台
            </p>
          </div>

          <form
            class="mt-7 space-y-4"
            novalidate
            @submit.prevent="handleSubmit"
          >
            <UFormField
              label="邮箱"
              name="email"
              :error="errors.email"
              required
            >
              <UInput
                v-model="form.email"
                type="email"
                size="lg"
                icon="i-lucide-mail"
                placeholder="name@erp.local"
                autocomplete="username"
                class="w-full"
                @update:model-value="errors.email = undefined"
              />
            </UFormField>

            <UFormField
              label="密码"
              name="password"
              :error="errors.password"
              required
            >
              <UInput
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                size="lg"
                icon="i-lucide-lock"
                placeholder="请输入密码"
                autocomplete="current-password"
                class="w-full"
                @update:model-value="errors.password = undefined"
              >
                <template #trailing>
                  <UButton
                    type="button"
                    color="neutral"
                    variant="link"
                    size="xs"
                    :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </UInput>
            </UFormField>

            <div class="flex items-center justify-end pt-1">
              <span class="text-xs text-slate-500 dark:text-slate-400">
                忘记密码请联系管理员
              </span>
            </div>

            <UButton
              type="submit"
              size="lg"
              block
              :loading="loading"
              label="登录"
              class="mt-1 rounded-xl"
            />

            <UAlert
              v-if="errorMessage"
              color="error"
              variant="subtle"
              icon="i-lucide-circle-alert"
              :title="errorMessage"
            />
          </form>

          <button
            type="button"
            class="mt-6 flex w-full items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/60 px-4 py-3 text-left transition hover:border-primary/30 hover:bg-primary/5 dark:border-slate-800 dark:bg-slate-950/30 dark:hover:border-primary/30 dark:hover:bg-primary/5"
            @click="demoModalOpen = true"
          >
            <span class="flex items-center gap-2">
              <UIcon
                name="i-lucide-users"
                class="size-4 text-slate-400"
              />
              <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
                演示账号
              </span>
            </span>
            <span class="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              点击选择
              <UIcon
                name="i-lucide-chevron-right"
                class="size-3.5"
              />
            </span>
          </button>
        </div>

        <p class="mt-4 text-center text-[11px] text-slate-400 dark:text-slate-500">
          内部系统 · 请使用公司账号登录
        </p>
      </section>
    </main>

    <footer class="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pb-6 text-[11px] text-slate-400 dark:text-slate-500">
      <span>© {{ year }} Clothing ERP</span>
      <span>内部系统</span>
    </footer>

    <UModal
      v-model:open="demoModalOpen"
      title="选择演示账号"
      description="点击账号自动填入登录表单"
      :ui="{ overlay: 'bg-slate-950/40 backdrop-blur-sm' }"
    >
      <template #body>
        <div class="space-y-2">
          <button
            v-for="account in demoAccounts"
            :key="account.email"
            type="button"
            class="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-primary/40 hover:bg-primary/5 dark:border-slate-700 dark:hover:border-primary/40 dark:hover:bg-primary/5"
            @click="selectDemo(account)"
          >
            <span class="flex min-w-0 items-center gap-3">
              <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UIcon
                  name="i-lucide-user-round"
                  class="size-4"
                />
              </span>
              <span class="min-w-0">
                <span class="block text-sm font-medium text-slate-800 dark:text-slate-100">
                  {{ account.role }}
                </span>
                <span class="block truncate text-xs text-slate-500 dark:text-slate-400">
                  {{ account.email }}
                </span>
                <span class="block text-[11px] text-slate-400 dark:text-slate-500">
                  {{ account.desc }}
                </span>
              </span>
            </span>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4 shrink-0 text-slate-300 dark:text-slate-600"
            />
          </button>
        </div>

        <p class="mt-4 text-center text-[11px] text-slate-400 dark:text-slate-500">
          密码统一为 123456 · 仅限演示环境
        </p>
      </template>
    </UModal>
  </div>
</template>
