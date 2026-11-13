<script setup lang="ts">
import type { ApiResponse } from '#shared/types/api'

useHead({ title: '客户管理' })

interface Customer {
  id: string
  code: string
  name: string
  country: string | null
  createdAt: string
  updatedAt: string
}

interface CustomerList {
  items: Customer[]
  total: number
  page: number
  pageSize: number
}

const { can } = useAuth()

const customers = ref<Customer[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const keyword = ref('')
const searchInput = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const hasPrev = computed(() => page.value > 1)
const hasNext = computed(() => page.value < totalPages.value)

const formOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const formError = ref('')
const form = reactive({
  code: '',
  name: '',
  country: ''
})

const modalTitle = computed(() => editingId.value ? '编辑客户' : '新建客户')

async function loadCustomers() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await $fetch<ApiResponse<CustomerList>>('/api/customers', {
      query: {
        page: page.value,
        pageSize,
        keyword: keyword.value || undefined
      }
    })
    customers.value = response.data.items
    total.value = response.data.total
  } catch (error) {
    customers.value = []
    total.value = 0
    errorMessage.value = getApiErrorMessage(error, '加载客户列表失败')
  } finally {
    loading.value = false
  }
}

function applySearch() {
  successMessage.value = ''
  keyword.value = searchInput.value.trim()
  page.value = 1
  loadCustomers()
}

function resetSearch() {
  successMessage.value = ''
  searchInput.value = ''
  keyword.value = ''
  page.value = 1
  loadCustomers()
}

function changePage(nextPage: number) {
  if (nextPage < 1 || nextPage > totalPages.value || nextPage === page.value) {
    return
  }
  page.value = nextPage
  loadCustomers()
}

function openCreate() {
  editingId.value = null
  form.code = ''
  form.name = ''
  form.country = ''
  formError.value = ''
  successMessage.value = ''
  formOpen.value = true
}

function openEdit(customer: Customer) {
  editingId.value = customer.id
  form.code = customer.code
  form.name = customer.name
  form.country = customer.country ?? ''
  formError.value = ''
  successMessage.value = ''
  formOpen.value = true
}

async function saveCustomer() {
  formError.value = ''
  const code = form.code.trim()
  const name = form.name.trim()
  if (!code) {
    formError.value = '请输入客户编码'
    return
  }
  if (!name) {
    formError.value = '请输入客户名称'
    return
  }

  const isEdit = Boolean(editingId.value)
  saving.value = true
  try {
    const body = {
      code,
      name,
      country: form.country.trim() || null
    }
    if (editingId.value) {
      await $fetch(`/api/customers/${editingId.value}`, { method: 'PATCH', body })
    } else {
      await $fetch('/api/customers', { method: 'POST', body })
    }
    formOpen.value = false
    successMessage.value = isEdit ? '客户已更新' : '客户已创建'
    await loadCustomers()
  } catch (error) {
    formError.value = getApiErrorMessage(error, '保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

function formatDate(value: string) {
  const date = new Date(value)
  const pad = (number: number) => String(number).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

onMounted(loadCustomers)
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">
          Customer
        </p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight">
          客户管理
        </h2>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          维护客户档案，共 {{ total }} 个客户。
        </p>
      </div>

      <UButton
        v-if="can('style:create')"
        icon="i-lucide-plus"
        label="新建客户"
        @click="openCreate"
      />
    </div>

    <UAlert
      v-if="successMessage"
      class="mt-4"
      color="success"
      variant="subtle"
      icon="i-lucide-circle-check"
      :title="successMessage"
    />

    <div class="mt-6 flex flex-wrap items-center gap-3">
      <UInput
        v-model="searchInput"
        icon="i-lucide-search"
        size="lg"
        placeholder="搜索客户编码、名称、国家"
        class="w-full sm:w-72"
        @keyup.enter="applySearch"
      />
      <UButton
        label="查询"
        @click="applySearch"
      />
      <UButton
        v-if="keyword"
        color="neutral"
        variant="outline"
        label="重置"
        @click="resetSearch"
      />
    </div>

    <UAlert
      v-if="errorMessage"
      class="mt-6"
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
          @click="loadCustomers"
        />
      </template>
    </UAlert>

    <div class="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                客户编码
              </th>
              <th class="px-5 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                客户名称
              </th>
              <th class="px-5 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                国家/地区
              </th>
              <th class="px-5 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                创建时间
              </th>
              <th class="px-5 py-3 text-right text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                操作
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <template v-if="loading">
              <tr>
                <td
                  colspan="5"
                  class="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  <UIcon
                    name="i-lucide-loader-circle"
                    class="mx-auto size-5 animate-spin text-primary"
                  />
                  <p class="mt-2">
                    正在加载客户…
                  </p>
                </td>
              </tr>
            </template>

            <template v-else-if="customers.length === 0">
              <tr>
                <td
                  colspan="5"
                  class="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  {{ keyword ? '没有找到匹配的客户' : '暂无客户，先新建一个吧' }}
                </td>
              </tr>
            </template>

            <template v-else>
              <tr
                v-for="customer in customers"
                :key="customer.id"
                class="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <td class="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                  {{ customer.code }}
                </td>
                <td class="px-5 py-4 font-medium">
                  {{ customer.name }}
                </td>
                <td class="px-5 py-4 text-slate-500 dark:text-slate-400">
                  {{ customer.country ?? '-' }}
                </td>
                <td class="whitespace-nowrap px-5 py-4 text-slate-500 dark:text-slate-400">
                  {{ formatDate(customer.createdAt) }}
                </td>
                <td class="px-5 py-4 text-right">
                  <UButton
                    v-if="can('style:update')"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    icon="i-lucide-pencil"
                    label="编辑"
                    @click="openEdit(customer)"
                  />
                  <span
                    v-else
                    class="text-xs text-slate-400 dark:text-slate-500"
                  >
                    只读
                  </span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span>共 {{ total }} 条 · 第 {{ page }} / {{ totalPages }} 页</span>
        <div class="flex items-center gap-2">
          <UButton
            color="neutral"
            variant="outline"
            size="xs"
            icon="i-lucide-chevron-left"
            label="上一页"
            :disabled="!hasPrev"
            @click="changePage(page - 1)"
          />
          <UButton
            color="neutral"
            variant="outline"
            size="xs"
            trailing-icon="i-lucide-chevron-right"
            label="下一页"
            :disabled="!hasNext"
            @click="changePage(page + 1)"
          />
        </div>
      </div>
    </div>

    <UModal
      v-model:open="formOpen"
      :title="modalTitle"
      description="客户编码全局唯一，保存后服务端会自动转大写。"
      :ui="{ overlay: 'bg-slate-950/40 backdrop-blur-sm' }"
    >
      <template #body>
        <form
          class="space-y-4"
          novalidate
          @submit.prevent="saveCustomer"
        >
          <UFormField
            label="客户编码"
            required
          >
            <UInput
              v-model="form.code"
              name="code"
              autocomplete="off"
              size="lg"
              class="w-full"
              placeholder="如 CUS-EU-001"
            />
          </UFormField>

          <UFormField
            label="客户名称"
            required
          >
            <UInput
              v-model="form.name"
              name="name"
              autocomplete="organization"
              size="lg"
              class="w-full"
              placeholder="请输入客户名称"
            />
          </UFormField>

          <UFormField label="国家/地区">
            <UInput
              v-model="form.country"
              name="country"
              autocomplete="country-name"
              size="lg"
              class="w-full"
              placeholder="如 美国 / 日本"
            />
          </UFormField>

          <UAlert
            v-if="formError"
            color="error"
            variant="subtle"
            icon="i-lucide-circle-alert"
            :title="formError"
          />

          <div class="flex justify-end gap-3 pt-2">
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              label="取消"
              @click="formOpen = false"
            />
            <UButton
              type="submit"
              :loading="saving"
              label="保存"
            />
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>
