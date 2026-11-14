<script setup lang="ts">
import type { ApiResponse } from '#shared/types/api'
import type { DataScope, PermissionGroup } from '#shared/permissions'
import { PERMISSION_GROUPS, hasPermission } from '#shared/permissions'
import type { AuditLogDto } from '#shared/types/audit'
import type { RoleDto, RoleSnapshot } from '#shared/types/role'

useHead({ title: '角色管理' })

const { success: notifySuccess, error: notifyError } = useNotify()

interface RoleList {
  items: RoleDto[]
  total: number
  page: number
  pageSize: number
}

interface AuditLogList {
  items: AuditLogDto[]
  total: number
  page: number
  pageSize: number
}

interface AuditEntry {
  log: AuditLogDto
  supported: boolean
  nameChange: string | null
  scopeChange: string | null
  activeChange: string | null
  remarkChange: string | null
  added: string[]
  removed: string[]
}

const scopeLabels: Record<DataScope, string> = {
  SELF: '本人',
  DEPT: '本部门',
  ALL: '全部'
}

const scopeOptions: Array<{ label: string, value: DataScope }> = [
  { label: '本人', value: 'SELF' },
  { label: '本部门', value: 'DEPT' },
  { label: '全部', value: 'ALL' }
]

const roles = ref<RoleDto[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const searchInput = ref('')
const status = ref<'all' | 'active' | 'inactive'>('all')
const loading = ref(false)
const errorMessage = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const hasPrev = computed(() => page.value > 1)
const hasNext = computed(() => page.value < totalPages.value)
const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' }
] as const

const detailOpen = ref(false)
const selectedRole = ref<RoleDto | null>(null)

const auditOpen = ref(false)
const auditRole = ref<RoleDto | null>(null)

const saving = ref(false)
const editName = ref('')
const editRemark = ref('')
const editPermissions = ref<string[]>([])
const editDataScope = ref<DataScope>('SELF')
const editActive = ref(true)

const createOpen = ref(false)
const creating = ref(false)
const createCode = ref('')
const createName = ref('')
const createRemark = ref('')
const createPermissions = ref<string[]>([])
const createDataScope = ref<DataScope>('SELF')
const createActive = ref(true)

const auditLogs = ref<AuditLogDto[]>([])
const auditLoading = ref(false)
const auditError = ref('')
const auditTotal = ref(0)

const isAdminRole = computed(() => selectedRole.value?.code === 'ADMIN')
const selectedPermissions = computed(() => selectedRole.value?.permissions ?? [])
const activePermissions = computed(() => isAdminRole.value ? selectedPermissions.value : editPermissions.value)
const activeHasAll = computed(() => activePermissions.value.includes('*'))
const displayScope = computed<DataScope>(() => isAdminRole.value ? selectedRole.value?.dataScope ?? 'SELF' : editDataScope.value)
const displayActive = computed(() => isAdminRole.value ? selectedRole.value?.active ?? true : editActive.value)
const selectedScopeLabel = computed(() => scopeLabels[displayScope.value])
const selectedScopeClass = computed(() => scopeClass(displayScope.value))
const hasUnsavedChanges = computed(() => {
  const role = selectedRole.value
  if (!role || isAdminRole.value) {
    return false
  }

  return editName.value.trim() !== role.name
    || (editRemark.value.trim() || null) !== role.remark
    || editDataScope.value !== role.dataScope
    || editActive.value !== role.active
    || editPermissions.value.length !== role.permissions.length
    || editPermissions.value.some(permission => !role.permissions.includes(permission))
})
const createCodeValid = computed(() => /^[A-Z][A-Z0-9_]{1,29}$/.test(createCode.value))
const canCreate = computed(() => createCodeValid.value
  && createName.value.trim().length > 0
  && createPermissions.value.length > 0)

const auditEntries = computed<AuditEntry[]>(() => auditLogs.value.map((log) => {
  const before = readSnapshot(log.before)
  const after = readSnapshot(log.after)
  if (!after) {
    return {
      log,
      supported: false,
      nameChange: null,
      scopeChange: null,
      activeChange: null,
      remarkChange: null,
      added: [],
      removed: []
    }
  }

  if (!before) {
    return {
      log,
      supported: true,
      nameChange: after.name,
      scopeChange: scopeLabels[after.dataScope],
      activeChange: after.active ? '启用' : '停用',
      remarkChange: after.remark,
      added: after.permissions,
      removed: []
    }
  }

  return {
    log,
    supported: true,
    nameChange: before.name !== after.name ? `${before.name} → ${after.name}` : null,
    scopeChange: before.dataScope !== after.dataScope
      ? `${scopeLabels[before.dataScope]} → ${scopeLabels[after.dataScope]}`
      : null,
    activeChange: before.active !== after.active
      ? `${before.active ? '启用' : '停用'} → ${after.active ? '启用' : '停用'}`
      : null,
    remarkChange: before.remark !== after.remark
      ? `${before.remark ?? '空'} → ${after.remark ?? '空'}`
      : null,
    added: after.permissions.filter(permission => !before.permissions.includes(permission)),
    removed: before.permissions.filter(permission => !before.permissions.includes(permission))
  }
}))

async function loadRoles() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await $fetch<ApiResponse<RoleList>>('/api/roles', {
      query: {
        page: page.value,
        pageSize: pageSize.value,
        keyword: keyword.value || undefined,
        status: status.value === 'all' ? undefined : status.value
      }
    })
    roles.value = response.data.items
    total.value = response.data.total
  } catch (error) {
    roles.value = []
    total.value = 0
    errorMessage.value = getApiErrorMessage(error, '加载角色列表失败')
  } finally {
    loading.value = false
  }
}

function applySearch() {
  keyword.value = searchInput.value.trim()
  page.value = 1
  loadRoles()
}

function applyStatus() {
  page.value = 1
  loadRoles()
}

function resetSearch() {
  searchInput.value = ''
  keyword.value = ''
  status.value = 'all'
  page.value = 1
  loadRoles()
}

function changePage(nextPage: number) {
  if (nextPage < 1 || nextPage > totalPages.value || nextPage === page.value) {
    return
  }
  page.value = nextPage
  loadRoles()
}

function changePageSize(nextPageSize: number) {
  pageSize.value = nextPageSize
  page.value = 1
  loadRoles()
}

async function loadAuditLogs(code: string) {
  auditLoading.value = true
  auditError.value = ''
  try {
    const response = await $fetch<ApiResponse<AuditLogList>>('/api/audit-logs', {
      query: {
        entityType: 'ROLE',
        entityId: code,
        page: 1,
        pageSize: 50
      }
    })
    auditLogs.value = response.data.items
    auditTotal.value = response.data.total
  } catch (error) {
    auditLogs.value = []
    auditTotal.value = 0
    auditError.value = getApiErrorMessage(error, '加载变更记录失败')
  } finally {
    auditLoading.value = false
  }
}

function scopeClass(scope: DataScope) {
  if (scope === 'ALL') {
    return 'bg-primary/10 text-primary'
  }
  if (scope === 'DEPT') {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
  }
  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
}

function fillForm(role: RoleDto) {
  editName.value = role.name
  editRemark.value = role.remark ?? ''
  editPermissions.value = [...role.permissions]
  editDataScope.value = role.dataScope
  editActive.value = role.active
}

function openDetail(role: RoleDto) {
  selectedRole.value = role
  fillForm(role)
  detailOpen.value = true
}

function openAudit(role: RoleDto) {
  auditRole.value = role
  auditLogs.value = []
  auditTotal.value = 0
  auditError.value = ''
  auditOpen.value = true
  loadAuditLogs(role.code)
}

function normalizeCreateCode() {
  createCode.value = createCode.value.toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 30)
}

function openCreate() {
  createCode.value = ''
  createName.value = ''
  createRemark.value = ''
  createPermissions.value = []
  createDataScope.value = 'SELF'
  createActive.value = true
  createOpen.value = true
}

function toggleCreatePermission(code: string) {
  const index = createPermissions.value.indexOf(code)
  if (index >= 0) {
    createPermissions.value.splice(index, 1)
  } else {
    createPermissions.value.push(code)
  }
}

async function submitCreateRole() {
  if (creating.value) {
    return
  }

  if (!createCodeValid.value) {
    notifyError('角色编码需以字母开头，只能包含字母、数字和下划线')
    return
  }
  if (!createName.value.trim()) {
    notifyError('请输入角色名称')
    return
  }
  if (createPermissions.value.length === 0) {
    notifyError('角色至少保留一个权限')
    return
  }

  creating.value = true
  try {
    const response = await $fetch<ApiResponse<RoleDto>>('/api/roles', {
      method: 'POST',
      body: {
        code: createCode.value,
        name: createName.value.trim(),
        remark: createRemark.value.trim() || null,
        permissions: createPermissions.value,
        dataScope: createDataScope.value,
        active: createActive.value
      }
    })

    createOpen.value = false
    searchInput.value = ''
    keyword.value = ''
    status.value = 'all'
    page.value = 1
    await loadRoles()
    const lastPage = Math.max(1, Math.ceil(total.value / pageSize.value))
    if (page.value !== lastPage) {
      page.value = lastPage
      await loadRoles()
    }
    notifySuccess('角色已创建', `角色「${response.data.name}」已创建`)
  } catch (error) {
    notifyError(getApiErrorMessage(error, '创建角色失败'))
  } finally {
    creating.value = false
  }
}

function togglePermission(code: string) {
  const index = editPermissions.value.indexOf(code)
  if (index >= 0) {
    if (editPermissions.value.length === 1) {
      notifyError('角色至少保留一个权限')
      return
    }
    editPermissions.value.splice(index, 1)
  } else {
    editPermissions.value.push(code)
  }
}

async function saveRole() {
  const role = selectedRole.value
  if (!role || saving.value) {
    return
  }

  if (!editName.value.trim()) {
    notifyError('请输入角色名称')
    return
  }
  if (editPermissions.value.length === 0) {
    notifyError('角色至少保留一个权限')
    return
  }

  saving.value = true
  try {
    const response = await $fetch<ApiResponse<RoleDto>>(`/api/roles/${role.code}`, {
      method: 'PATCH',
      body: {
        name: editName.value.trim(),
        remark: editRemark.value.trim() || null,
        permissions: editPermissions.value,
        dataScope: editDataScope.value,
        active: editActive.value
      }
    })

    const updated = response.data
    selectedRole.value = updated
    fillForm(updated)
    await loadRoles()
    if (page.value > totalPages.value) {
      page.value = totalPages.value
      await loadRoles()
    }
    notifySuccess('角色设置已保存', `${updated.name} 的权限设置已更新`)
  } catch (error) {
    notifyError(getApiErrorMessage(error, '保存角色失败'))
  } finally {
    saving.value = false
  }
}

function grantedCount(group: PermissionGroup) {
  return group.permissions.filter(permission => hasPermission(activePermissions.value, permission.code)).length
}

function createGrantedCount(group: PermissionGroup) {
  return group.permissions.filter(permission => hasPermission(createPermissions.value, permission.code)).length
}

function permissionLabel(code: string) {
  for (const group of PERMISSION_GROUPS) {
    const matched = group.permissions.find(permission => permission.code === code)
    if (matched) {
      return matched.label
    }
  }
  return code === '*' ? '全部权限' : code
}

function readSnapshot(value: unknown): RoleSnapshot | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>
  if (typeof record.name !== 'string'
    || !Array.isArray(record.permissions)
    || typeof record.dataScope !== 'string'
    || typeof record.active !== 'boolean') {
    return null
  }

  return {
    name: record.name,
    permissions: record.permissions.filter((item): item is string => typeof item === 'string'),
    dataScope: record.dataScope === 'ALL' || record.dataScope === 'DEPT' ? record.dataScope : 'SELF',
    active: record.active,
    remark: typeof record.remark === 'string' && record.remark ? record.remark : null
  }
}

function hasChanges(entry: AuditEntry) {
  return entry.nameChange !== null
    || entry.scopeChange !== null
    || entry.activeChange !== null
    || entry.remarkChange !== null
    || entry.added.length > 0
    || entry.removed.length > 0
}

function actionLabel(action: string) {
  if (action === 'CREATE_ROLE') {
    return '新增角色'
  }
  return action === 'UPDATE_ROLE' ? '修改角色' : action
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

onMounted(loadRoles)
</script>

<template>
  <div class="w-full">
    <PageHeader
      title="角色管理"
      :description="`维护角色权限、数据范围与启停状态，共 ${total} 个角色。`"
    >
      <template #actions>
        <UButton
          color="primary"
          icon="i-lucide-plus"
          label="新增角色"
          @click="openCreate"
        />
      </template>
    </PageHeader>

    <div class="mt-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <UInput
        v-model="searchInput"
        icon="i-lucide-search"
        placeholder="搜索角色名称、编码或备注"
        class="w-full sm:w-72"
        @keyup.enter="applySearch"
      />
      <select
        v-model="status"
        class="select-control h-8 min-w-[110px] rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        @change="applyStatus"
      >
        <option
          v-for="option in statusOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <UButton
        label="查询"
        @click="applySearch"
      />
      <UButton
        v-if="keyword || status !== 'all'"
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
          @click="loadRoles"
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
          @click="loadRoles"
        />
      </template>
    </UAlert>

    <div class="mt-3 hidden overflow-hidden rounded-lg border border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[980px] text-sm">
          <thead class="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th class="px-4 py-2.5 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                角色
              </th>
              <th class="px-4 py-2.5 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                数据范围
              </th>
              <th class="px-4 py-2.5 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                用户数
              </th>
              <th class="px-4 py-2.5 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                状态
              </th>
              <th class="px-4 py-2.5 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                备注
              </th>
              <th class="px-4 py-2.5 text-right text-xs font-medium text-slate-500 dark:text-slate-400">
                操作
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="loading">
              <td
                colspan="6"
                class="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                <UIcon
                  name="i-lucide-loader-circle"
                  class="mx-auto size-5 animate-spin text-primary"
                />
                <p class="mt-2">
                  正在加载角色…
                </p>
              </td>
            </tr>

            <tr v-else-if="roles.length === 0">
              <td
                colspan="6"
                class="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                {{ keyword || status !== 'all' ? '没有找到匹配的角色' : '暂无角色数据' }}
              </td>
            </tr>

            <template v-else>
              <tr
                v-for="role in roles"
                :key="role.code"
                class="cursor-pointer transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                @click="openDetail(role)"
              >
                <td class="px-4 py-3">
                  <span class="block whitespace-nowrap text-[13px] font-medium text-slate-900 dark:text-white">
                    {{ role.name }}
                  </span>
                  <span class="mt-0.5 block font-mono text-[10px] text-slate-400 dark:text-slate-500">
                    {{ role.code }}
                  </span>
                </td>

                <td class="px-4 py-3">
                  <span
                    class="inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium"
                    :class="scopeClass(role.dataScope)"
                  >
                    {{ scopeLabels[role.dataScope] }}
                  </span>
                </td>

                <td class="px-4 py-3 text-center text-[13px] text-slate-600 tabular-nums dark:text-slate-300">
                  {{ role.userCount }}
                </td>

                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium"
                    :class="role.active
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'"
                  >
                    {{ role.active ? '启用' : '停用' }}
                  </span>
                </td>

                <td class="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300">
                  <span
                    v-if="role.remark"
                    class="block max-w-[260px] truncate"
                    :title="role.remark"
                  >
                    {{ role.remark }}
                  </span>
                  <span
                    v-else
                    class="text-slate-400 dark:text-slate-600"
                  >
                    —
                  </span>
                </td>

                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1 whitespace-nowrap">
                    <UButton
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      icon="i-lucide-history"
                      label="变更记录"
                      @click.stop="openAudit(role)"
                    />
                    <UButton
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      icon="i-lucide-pencil"
                      label="编辑"
                      @click.stop="openDetail(role)"
                    />
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
          正在加载角色…
        </p>
      </div>

      <div
        v-else-if="roles.length === 0"
        class="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
      >
        {{ keyword || status !== 'all' ? '没有找到匹配的角色' : '暂无角色数据' }}
      </div>

      <template v-else>
        <MobileListCard
          v-for="role in roles"
          :key="role.code"
          :title="role.name"
          :subtitle="role.code"
        >
          <template #aside>
            <span
              class="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
              :class="role.active
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'"
            >
              {{ role.active ? '启用' : '停用' }}
            </span>
          </template>

          <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span
              class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
              :class="scopeClass(role.dataScope)"
            >
              {{ scopeLabels[role.dataScope] }}
            </span>
            <span class="text-slate-300 dark:text-slate-600">·</span>
            <span>用户 {{ role.userCount }}</span>
          </div>

          <p
            v-if="role.remark"
            class="mt-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400"
          >
            {{ role.remark }}
          </p>

          <template #footer>
            <div class="flex justify-end gap-1">
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-lucide-history"
                label="变更记录"
                @click="openAudit(role)"
              />
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-lucide-pencil"
                label="编辑"
                @click="openDetail(role)"
              />
            </div>
          </template>
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
      v-model:open="detailOpen"
      :title="selectedRole?.name ?? '角色详情'"
      :description="'角色权限与数据范围'"
      :ui="{ overlay: 'bg-slate-950/40 backdrop-blur-sm', content: 'sm:max-w-3xl' }"
    >
      <template #body>
        <div
          v-if="selectedRole"
          class="space-y-5"
        >
          <div class="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/50">
            <span class="font-mono text-xs text-slate-500 dark:text-slate-400">
              {{ selectedRole.code }}
            </span>
            <span
              class="rounded-full px-2 py-0.5 text-[11px] font-medium"
              :class="selectedScopeClass"
            >
              {{ selectedScopeLabel }}
            </span>
            <span class="text-slate-500 dark:text-slate-400">
              关联用户 {{ selectedRole.userCount }}
            </span>
            <span
              class="inline-flex items-center gap-1.5 text-xs"
              :class="displayActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'"
            >
              <span
                class="size-1.5 rounded-full"
                :class="displayActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'"
              />
              {{ displayActive ? '启用' : '停用' }}
            </span>
          </div>

          <div
            v-if="!isAdminRole"
            class="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
          >
            <label class="block space-y-1.5">
              <span class="text-xs font-medium text-slate-500 dark:text-slate-400">角色名称</span>
              <input
                v-model="editName"
                type="text"
                maxlength="50"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900"
              >
            </label>

            <div class="grid gap-3 sm:grid-cols-2">
              <label class="block space-y-1.5">
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">数据范围</span>
                <select
                  v-model="editDataScope"
                  class="select-control w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900"
                >
                  <option
                    v-for="option in scopeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </label>

              <label class="flex items-center gap-2 self-end rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
                <input
                  v-model="editActive"
                  type="checkbox"
                  class="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                >
                <span>启用该角色</span>
              </label>
            </div>

            <label class="block space-y-1.5">
              <span class="text-xs font-medium text-slate-500 dark:text-slate-400">备注</span>
              <textarea
                v-model="editRemark"
                rows="3"
                maxlength="500"
                placeholder="可选，最多 500 个字符"
                class="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900"
              />
            </label>

            <p class="text-[11px] text-slate-400 dark:text-slate-500">
              角色编码 {{ selectedRole.code }} 创建后不可修改。
            </p>
          </div>

          <div
            v-else
            class="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary"
          >
            系统内置管理员角色，权限、数据范围和启用状态受保护，不可编辑。
          </div>

          <div
            v-if="activeHasAll"
            class="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary"
          >
            该角色拥有全部权限（`*`）
          </div>

          <div
            v-for="group in PERMISSION_GROUPS"
            :key="group.key"
            class="space-y-2"
          >
            <div class="flex items-center justify-between gap-3">
              <h4 class="text-sm font-semibold">
                {{ group.label }}
              </h4>
              <span class="text-[11px] text-slate-400 dark:text-slate-500">
                {{ grantedCount(group) }} / {{ group.permissions.length }}
              </span>
            </div>

            <div class="grid gap-2 sm:grid-cols-2">
              <label
                v-for="permission in group.permissions"
                :key="permission.code"
                class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 transition dark:border-slate-700"
                :class="!isAdminRole
                  ? 'cursor-pointer hover:border-primary/40 hover:bg-primary/5'
                  : ''"
              >
                <input
                  v-if="!isAdminRole"
                  type="checkbox"
                  class="size-4 shrink-0 rounded border-slate-300 text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                  :checked="hasPermission(activePermissions, permission.code)"
                  :disabled="editPermissions.length === 1 && hasPermission(editPermissions, permission.code)"
                  @change="togglePermission(permission.code)"
                >
                <UIcon
                  v-else
                  :name="hasPermission(activePermissions, permission.code) ? 'i-lucide-check' : 'i-lucide-minus'"
                  class="size-4 shrink-0"
                  :class="hasPermission(activePermissions, permission.code)
                    ? 'text-primary'
                    : 'text-slate-300 dark:text-slate-600'"
                />
                <span class="text-sm">
                  {{ permission.label }}
                </span>
                <span class="ml-auto font-mono text-[10px] text-slate-400 dark:text-slate-500">
                  {{ permission.code }}
                </span>
              </label>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full flex-wrap items-center justify-between gap-3">
          <p class="text-[11px] text-slate-400 dark:text-slate-500">
            <template v-if="isAdminRole">
              管理员角色受保护，不可编辑。
            </template>
            <template v-else>
              修改后点击保存，立即生效并写入变更记录。
            </template>
          </p>

          <div class="flex gap-2">
            <UButton
              v-if="!isAdminRole"
              color="primary"
              label="保存"
              :loading="saving"
              :disabled="!hasUnsavedChanges"
              @click="saveRole"
            />
            <UButton
              color="neutral"
              variant="outline"
              label="关闭"
              @click="detailOpen = false"
            />
          </div>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="auditOpen"
      :title="auditRole ? auditRole.name + ' · 变更记录' : '变更记录'"
      description="角色权限、数据范围与备注的变更历史"
      :ui="{ overlay: 'bg-slate-950/40 backdrop-blur-sm', content: 'sm:max-w-2xl' }"
    >
      <template #body>
        <div
          v-if="auditRole"
          class="space-y-4"
        >
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/50">
            <span class="font-mono text-xs text-slate-500 dark:text-slate-400">
              {{ auditRole.code }}
            </span>
            <span class="text-slate-500 dark:text-slate-400">
              共 {{ auditTotal }} 条记录
            </span>
          </div>

          <div
            v-if="auditLoading"
            class="rounded-xl border border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400"
          >
            <UIcon
              name="i-lucide-loader-circle"
              class="mx-auto size-5 animate-spin text-primary"
            />
            <p class="mt-2">
              正在加载变更记录…
            </p>
          </div>

          <UAlert
            v-else-if="auditError"
            color="error"
            variant="subtle"
            icon="i-lucide-circle-alert"
            :title="auditError"
          >
            <template #description>
              <UButton
                color="error"
                variant="link"
                label="重新加载"
                @click="loadAuditLogs(auditRole.code)"
              />
            </template>
          </UAlert>

          <div
            v-else-if="auditEntries.length === 0"
            class="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400"
          >
            暂无变更记录
          </div>

          <div
            v-else
            class="space-y-3"
          >
            <div
              v-for="entry in auditEntries"
              :key="entry.log.id"
              class="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="flex size-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                    {{ entry.log.actor.name.slice(0, 1) }}
                  </span>
                  <div>
                    <p class="text-sm font-medium">
                      {{ entry.log.actor.name }}
                    </p>
                    <p class="text-[11px] text-slate-400 dark:text-slate-500">
                      {{ entry.log.actor.email }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {{ actionLabel(entry.log.action) }}
                  </span>
                  <span class="text-[11px] text-slate-400 dark:text-slate-500">
                    {{ formatDateTime(entry.log.createdAt) }}
                  </span>
                </div>
              </div>

              <div class="mt-3 space-y-2 text-sm">
                <template v-if="entry.supported">
                  <p
                    v-if="entry.nameChange"
                    class="text-slate-600 dark:text-slate-300"
                  >
                    名称：<span class="text-slate-900 dark:text-white">{{ entry.nameChange }}</span>
                  </p>
                  <p
                    v-if="entry.scopeChange"
                    class="text-slate-600 dark:text-slate-300"
                  >
                    数据范围：<span class="text-slate-900 dark:text-white">{{ entry.scopeChange }}</span>
                  </p>
                  <p
                    v-if="entry.activeChange"
                    class="text-slate-600 dark:text-slate-300"
                  >
                    状态：<span class="text-slate-900 dark:text-white">{{ entry.activeChange }}</span>
                  </p>
                  <p
                    v-if="entry.remarkChange"
                    class="text-slate-600 dark:text-slate-300"
                  >
                    备注：<span class="text-slate-900 dark:text-white">{{ entry.remarkChange }}</span>
                  </p>

                  <div
                    v-if="entry.added.length > 0"
                    class="flex flex-wrap items-center gap-1.5"
                  >
                    <span class="text-xs text-slate-400 dark:text-slate-500">新增权限</span>
                    <span
                      v-for="code in entry.added"
                      :key="code"
                      class="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    >
                      + {{ permissionLabel(code) }}
                    </span>
                  </div>

                  <div
                    v-if="entry.removed.length > 0"
                    class="flex flex-wrap items-center gap-1.5"
                  >
                    <span class="text-xs text-slate-400 dark:text-slate-500">移除权限</span>
                    <span
                      v-for="code in entry.removed"
                      :key="code"
                      class="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                    >
                      − {{ permissionLabel(code) }}
                    </span>
                  </div>

                  <p
                    v-if="!hasChanges(entry)"
                    class="text-xs text-slate-400 dark:text-slate-500"
                  >
                    未检测到字段差异
                  </p>
                </template>

                <p
                  v-else
                  class="text-xs text-slate-400 dark:text-slate-500"
                >
                  该记录没有可展示的快照
                </p>
              </div>

              <p
                v-if="entry.log.ip"
                class="mt-2 font-mono text-[10px] text-slate-400 dark:text-slate-500"
              >
                IP {{ entry.log.ip }}
              </p>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end">
          <UButton
            color="neutral"
            variant="outline"
            label="关闭"
            @click="auditOpen = false"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="createOpen"
      title="新增角色"
      description="角色编码创建后不可修改"
      :ui="{ overlay: 'bg-slate-950/40 backdrop-blur-sm', content: 'sm:max-w-3xl' }"
    >
      <template #body>
        <div class="space-y-5">
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="block space-y-1.5">
              <span class="text-xs font-medium text-slate-500 dark:text-slate-400">角色编码</span>
              <input
                v-model="createCode"
                type="text"
                maxlength="30"
                placeholder="如 CUSTOM_QC"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm uppercase outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900"
                @input="normalizeCreateCode"
              >
              <span class="text-[11px] text-slate-400 dark:text-slate-500">
                大写字母开头，可包含数字和下划线，2–30 位。
              </span>
            </label>

            <label class="block space-y-1.5">
              <span class="text-xs font-medium text-slate-500 dark:text-slate-400">角色名称</span>
              <input
                v-model="createName"
                type="text"
                maxlength="50"
                placeholder="如 质量主管"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900"
              >
            </label>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <label class="block space-y-1.5">
              <span class="text-xs font-medium text-slate-500 dark:text-slate-400">数据范围</span>
              <select
                v-model="createDataScope"
                class="select-control w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900"
              >
                <option
                  v-for="option in scopeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </label>

            <label class="flex items-center gap-2 self-end rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
              <input
                v-model="createActive"
                type="checkbox"
                class="size-4 rounded border-slate-300 text-primary focus:ring-primary"
              >
              <span>启用该角色</span>
            </label>
          </div>

          <label class="block space-y-1.5">
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">备注</span>
            <textarea
              v-model="createRemark"
              rows="3"
              maxlength="500"
              placeholder="可选，最多 500 个字符"
              class="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>

          <div
            v-for="group in PERMISSION_GROUPS"
            :key="group.key"
            class="space-y-2"
          >
            <div class="flex items-center justify-between gap-3">
              <h4 class="text-sm font-semibold">
                {{ group.label }}
              </h4>
              <span class="text-[11px] text-slate-400 dark:text-slate-500">
                {{ createGrantedCount(group) }} / {{ group.permissions.length }}
              </span>
            </div>

            <div class="grid gap-2 sm:grid-cols-2">
              <label
                v-for="permission in group.permissions"
                :key="permission.code"
                class="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 transition hover:border-primary/40 hover:bg-primary/5 dark:border-slate-700"
              >
                <input
                  type="checkbox"
                  class="size-4 shrink-0 rounded border-slate-300 text-primary focus:ring-primary"
                  :checked="hasPermission(createPermissions, permission.code)"
                  @change="toggleCreatePermission(permission.code)"
                >
                <span class="text-sm">
                  {{ permission.label }}
                </span>
                <span class="ml-auto font-mono text-[10px] text-slate-400 dark:text-slate-500">
                  {{ permission.code }}
                </span>
              </label>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full flex-wrap items-center justify-between gap-3">
          <p class="text-[11px] text-slate-400 dark:text-slate-500">
            创建后编码不可修改，权限至少选择一个。
          </p>

          <div class="flex gap-2">
            <UButton
              color="neutral"
              variant="outline"
              label="取消"
              :disabled="creating"
              @click="createOpen = false"
            />
            <UButton
              color="primary"
              label="创建"
              :loading="creating"
              :disabled="!canCreate"
              @click="submitCreateRole"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
