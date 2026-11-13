<script setup lang="ts">
import type { ApiResponse } from '#shared/types/api'
import type { AuthUser } from '#shared/types/auth'

useHead({ title: '个人中心' })

const { user, fetchMe } = useAuth()

const activeTab = ref<'profile' | 'password'>('profile')
const savingProfile = ref(false)
const changingPassword = ref(false)
const profileError = ref('')
const profileSuccess = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')

const profileForm = reactive({
  name: '',
  email: '',
  phone: '',
  gender: '' as '' | 'MALE' | 'FEMALE'
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const roleNames = computed(() => {
  const names = user.value?.roles.map(role => role.name) ?? []
  return names.length > 0 ? names.join(' / ') : '未分配角色'
})

const userInitial = computed(() => user.value?.name?.charAt(0) ?? '?')

const deptLabels: Record<string, string> = {
  MANAGEMENT: '总经办',
  DESIGN: '设计部',
  SAMPLE: '打版部',
  COST: '核价部',
  SALES: '业务部',
  MERCHANDISING: '跟单部',
  QC: '品控部',
  WAREHOUSE: '仓储部',
  FINANCE: '财务部'
}

const deptLabel = computed(() => {
  const deptId = user.value?.deptId
  if (!deptId) {
    return '未设置'
  }
  return deptLabels[deptId] ?? deptId
})

watchEffect(() => {
  if (!user.value) {
    return
  }
  profileForm.name = user.value.name
  profileForm.email = user.value.email
  profileForm.phone = user.value.phone ?? ''
  profileForm.gender = user.value.gender === 'MALE' || user.value.gender === 'FEMALE'
    ? user.value.gender
    : ''
})

function formatDate(value?: string) {
  if (!value) {
    return '-'
  }
  const date = new Date(value)
  const pad = (number: number) => String(number).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

async function saveProfile() {
  profileError.value = ''
  profileSuccess.value = ''

  if (!profileForm.name.trim()) {
    profileError.value = '请输入用户昵称'
    return
  }
  if (!profileForm.email.trim()) {
    profileError.value = '请输入邮箱'
    return
  }

  savingProfile.value = true
  try {
    await $fetch<ApiResponse<AuthUser>>('/api/users/me', {
      method: 'PATCH',
      body: {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim() || null,
        gender: profileForm.gender || null
      }
    })
    await fetchMe()
    profileSuccess.value = '基本资料已保存'
  } catch (error) {
    profileError.value = getApiErrorMessage(error, '保存失败，请稍后重试')
  } finally {
    savingProfile.value = false
  }
}

async function changePassword() {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (!passwordForm.oldPassword) {
    passwordError.value = '请输入旧密码'
    return
  }
  if (passwordForm.newPassword.length < 6) {
    passwordError.value = '新密码至少 6 位'
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = '两次输入的新密码不一致'
    return
  }

  changingPassword.value = true
  try {
    await $fetch('/api/users/me/password', {
      method: 'PATCH',
      body: {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      }
    })
    passwordSuccess.value = '密码修改成功'
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    passwordError.value = getApiErrorMessage(error, '修改密码失败，请稍后重试')
  } finally {
    changingPassword.value = false
  }
}

function closePage() {
  navigateTo('/')
}
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <div class="grid gap-6 lg:grid-cols-[320px_1fr]">
      <section class="min-w-0 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 class="text-base font-semibold tracking-tight">
          个人信息
        </h2>

        <div class="mt-6 flex flex-col items-center text-center">
          <div class="flex size-28 items-center justify-center rounded-full bg-primary/10 text-4xl font-semibold text-primary">
            {{ userInitial }}
          </div>
          <p class="mt-4 text-lg font-semibold">
            {{ user?.name }}
          </p>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {{ roleNames }}
          </p>
        </div>

        <dl class="mt-6 divide-y divide-slate-100 text-sm dark:divide-slate-800">
          <div class="flex items-center justify-between gap-4 py-3">
            <dt class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <UIcon
                name="i-lucide-user"
                class="size-4"
              />
              用户名称
            </dt>
            <dd class="text-right font-medium">
              {{ user?.name }}
            </dd>
          </div>

          <div class="flex items-center justify-between gap-4 py-3">
            <dt class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <UIcon
                name="i-lucide-phone"
                class="size-4"
              />
              手机号码
            </dt>
            <dd class="text-right font-medium">
              {{ user?.phone ?? '未设置' }}
            </dd>
          </div>

          <div class="flex items-center justify-between gap-4 py-3">
            <dt class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <UIcon
                name="i-lucide-mail"
                class="size-4"
              />
              用户邮箱
            </dt>
            <dd class="max-w-48 truncate text-right font-medium">
              {{ user?.email }}
            </dd>
          </div>

          <div class="flex items-center justify-between gap-4 py-3">
            <dt class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <UIcon
                name="i-lucide-building-2"
                class="size-4"
              />
              所属部门
            </dt>
            <dd class="text-right font-medium">
              {{ deptLabel }}
            </dd>
          </div>

          <div class="flex items-center justify-between gap-4 py-3">
            <dt class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <UIcon
                name="i-lucide-shield"
                class="size-4"
              />
              所属角色
            </dt>
            <dd class="text-right font-medium">
              {{ roleNames }}
            </dd>
          </div>

          <div class="flex items-center justify-between gap-4 py-3">
            <dt class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <UIcon
                name="i-lucide-calendar"
                class="size-4"
              />
              创建日期
            </dt>
            <dd class="text-right font-medium">
              {{ formatDate(user?.createdAt) }}
            </dd>
          </div>
        </dl>
      </section>

      <section class="min-w-0 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 class="text-base font-semibold tracking-tight">
          基本资料
        </h2>

        <div class="mt-4 flex gap-6 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            class="border-b-2 px-1 pb-3 text-sm font-medium transition"
            :class="activeTab === 'profile'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
            @click="activeTab = 'profile'"
          >
            基本资料
          </button>
          <button
            type="button"
            class="border-b-2 px-1 pb-3 text-sm font-medium transition"
            :class="activeTab === 'password'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
            @click="activeTab = 'password'"
          >
            修改密码
          </button>
        </div>

        <form
          v-if="activeTab === 'profile'"
          class="mt-6 max-w-2xl space-y-5"
          novalidate
          @submit.prevent="saveProfile"
        >
          <UFormField
            label="用户昵称"
            required
          >
            <UInput
              v-model="profileForm.name"
              name="name"
              autocomplete="name"
              size="lg"
              class="w-full"
              placeholder="请输入用户昵称"
            />
          </UFormField>

          <UFormField label="手机号码">
            <UInput
              v-model="profileForm.phone"
              name="phone"
              autocomplete="tel"
              size="lg"
              class="w-full"
              placeholder="请输入手机号码"
            />
          </UFormField>

          <UFormField
            label="邮箱"
            required
          >
            <UInput
              v-model="profileForm.email"
              name="email"
              autocomplete="email"
              type="email"
              size="lg"
              class="w-full"
              placeholder="请输入邮箱"
            />
          </UFormField>

          <UFormField label="性别">
            <div class="flex items-center gap-6 pt-1">
              <label class="flex items-center gap-2 text-sm">
                <input
                  v-model="profileForm.gender"
                  type="radio"
                  value="MALE"
                  class="size-4"
                  style="accent-color: var(--ui-primary)"
                >
                男
              </label>
              <label class="flex items-center gap-2 text-sm">
                <input
                  v-model="profileForm.gender"
                  type="radio"
                  value="FEMALE"
                  class="size-4"
                  style="accent-color: var(--ui-primary)"
                >
                女
              </label>
            </div>
          </UFormField>

          <UAlert
            v-if="profileError"
            color="error"
            variant="subtle"
            icon="i-lucide-circle-alert"
            :title="profileError"
          />
          <UAlert
            v-if="profileSuccess"
            color="success"
            variant="subtle"
            icon="i-lucide-circle-check"
            :title="profileSuccess"
          />

          <div class="flex gap-3 pt-2">
            <UButton
              type="submit"
              :loading="savingProfile"
              label="保存"
            />
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              label="关闭"
              @click="closePage"
            />
          </div>
        </form>

        <form
          v-else
          class="mt-6 max-w-2xl space-y-5"
          novalidate
          @submit.prevent="changePassword"
        >
          <input
            type="text"
            name="username"
            autocomplete="username"
            :value="user?.email ?? ''"
            class="hidden"
            tabindex="-1"
            aria-hidden="true"
          >
          <UFormField
            label="旧密码"
            required
          >
            <UInput
              v-model="passwordForm.oldPassword"
              name="oldPassword"
              autocomplete="current-password"
              type="password"
              size="lg"
              class="w-full"
              placeholder="请输入旧密码"
            />
          </UFormField>

          <UFormField
            label="新密码"
            required
          >
            <UInput
              v-model="passwordForm.newPassword"
              name="newPassword"
              autocomplete="new-password"
              type="password"
              size="lg"
              class="w-full"
              placeholder="请输入新密码"
            />
          </UFormField>

          <UFormField
            label="确认密码"
            required
          >
            <UInput
              v-model="passwordForm.confirmPassword"
              name="confirmPassword"
              autocomplete="new-password"
              type="password"
              size="lg"
              class="w-full"
              placeholder="请再次输入新密码"
            />
          </UFormField>

          <UAlert
            v-if="passwordError"
            color="error"
            variant="subtle"
            icon="i-lucide-circle-alert"
            :title="passwordError"
          />
          <UAlert
            v-if="passwordSuccess"
            color="success"
            variant="subtle"
            icon="i-lucide-circle-check"
            :title="passwordSuccess"
          />

          <div class="flex gap-3 pt-2">
            <UButton
              type="submit"
              :loading="changingPassword"
              label="保存"
            />
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              label="关闭"
              @click="closePage"
            />
          </div>
        </form>
      </section>
    </div>
  </div>
</template>
