<script setup lang="ts">
import type { ApiResponse } from '#shared/types/api'
import { PERMISSIONS } from '#shared/permissions'

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
const { success: notifySuccess, error: notifyError } = useNotify()

const customers = ref<Customer[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const searchInput = ref('')
const loading = ref(false)
const errorMessage = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const hasPrev = computed(() => page.value > 1)
const hasNext = computed(() => page.value < totalPages.value)

const formOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
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
        pageSize: pageSize.value,
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
  keyword.value = searchInput.value.trim()
  page.value = 1
  loadCustomers()
}

function resetSearch() {
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

function changePageSize(nextPageSize: number) {
  pageSize.value = nextPageSize
  page.value = 1
  loadCustomers()
}

function openCreate() {
  editingId.value = null
  form.code = ''
  form.name = ''
  form.country = ''
  formOpen.value = true
}

function openEdit(customer: Customer) {
  editingId.value = customer.id
  form.code = customer.code
  form.name = customer.name
  form.country = customer.country ?? ''
  formOpen.value = true
}

async function saveCustomer() {
  const code = form.code.trim()
  const name = form.name.trim()
  if (!code) {
    notifyError('请输入客户编码')
    return
  }
  if (!name) {
    notifyError('请输入客户名称')
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
    notifySuccess(isEdit ? '客户已更新' : '客户已创建', `客户「${name}」已保存`)
    await loadCustomers()
  } catch (error) {
    notifyError(getApiErrorMessage(error, '保存失败，请稍后重试'))
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
  <div class="w-full">
    <PageHeader
      title="客户管理"
      :description="`维护客户档案，共 ${total} 个客户。`"
    >
      <template #actions>
        <UButton
          v-if="can(PERMISSIONS.STYLE_CREATE)"
          icon="i-lucide-plus"
          label="新建客户"
          @click="openCreate"
        />
      </template>
    </PageHeader>

    <div class="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <UInput
        v-model="searchInput"
        icon="i-lucide-search"
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
      <div class="ml-auto">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-refresh-cw"
          label="刷新"
          :loading="loading"
          @click="loadCustomers"
        />
      </div>
    </div>

    <UAlert
      v-if="errorMessage"
      class="mt-3"
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

    <div class="mt-3 hidden overflow-hidden rounded-lg border border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] text-sm">
          <thead class="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th class="px-4 py-2.5 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                客户编码
              </th>
              <th class="px-4 py-2.5 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                客户名称
              </th>
              <th class="px-4 py-2.5 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                国家/地区
              </th>
              <th class="px-4 py-2.5 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                创建时间
              </th>
              <th class="px-4 py-2.5 text-right text-xs font-medium text-slate-500 dark:text-slate-400">
                操作
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="loading">
              <td
                colspan="5"
                class="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
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

            <tr v-else-if="customers.length === 0">
              <td
                colspan="5"
                class="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                {{ keyword ? '没有找到匹配的客户' : '暂无客户，先新建一个吧' }}
              </td>
            </tr>

            <template v-else>
              <tr
                v-for="customer in customers"
                :key="customer.id"
                class="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
              >
                <td class="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {{ customer.code }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-[13px] font-medium text-slate-900 dark:text-white">
                  {{ customer.name }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-[13px] text-slate-500 dark:text-slate-400">
                  {{ customer.country ?? '—' }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                  {{ formatDate(customer.createdAt) }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end">
                    <UButton
                      v-if="can(PERMISSIONS.STYLE_UPDATE)"
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
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <ListPagination
        :total="total"
        :page="page"
        :total-pages="totalPages"
        :page-size="pageSize"
        :has-prev="hasPrev"
        :has-next="hasNext"
        class="border-t border-slate-200 px-4 py-2.5 dark:border-slate-800"
        @change-page="changePage"
        @change-page-size="changePageSize"
      />
    </div>

    <div class="mt-3 space-y-3 lg:hidden">
      <div
        v-if="loading"
        class="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="mx-auto size-5 animate-spin text-primary"
        />
        <p class="mt-2">
          正在加载客户…
        </p>
      </div>

      <div
        v-else-if="customers.length === 0"
        class="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
      >
        {{ keyword ? '没有找到匹配的客户' : '暂无客户，先新建一个吧' }}
      </div>

      <template v-else>
        <MobileListCard
          v-for="customer in customers"
          :key="customer.id"
          :title="customer.name"
          :subtitle="customer.code"
        >
          <template #aside>
            <UButton
              v-if="can(PERMISSIONS.STYLE_UPDATE)"
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-lucide-pencil"
              label="编辑"
              @click="openEdit(customer)"
            />
            <span
              v-else
              class="shrink-0 text-xs text-slate-400 dark:text-slate-500"
            >
              只读
            </span>
          </template>

          <dl class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt class="text-slate-500 dark:text-slate-400">
                国家/地区
              </dt>
              <dd class="mt-0.5 text-slate-700 dark:text-slate-200">
                {{ customer.country ?? '—' }}
              </dd>
            </div>
            <div>
              <dt class="text-slate-500 dark:text-slate-400">
                创建时间
              </dt>
              <dd class="mt-0.5 text-slate-700 dark:text-slate-200">
                {{ formatDate(customer.createdAt) }}
              </dd>
            </div>
          </dl>
        </MobileListCard>
      </template>

      <ListPagination
        :total="total"
        :page="page"
        :total-pages="totalPages"
        :page-size="pageSize"
        :has-prev="hasPrev"
        :has-next="hasNext"
        class="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
        @change-page="changePage"
        @change-page-size="changePageSize"
      />
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
