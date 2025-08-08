<script setup lang="ts">
import RolePermissionsDialog from '@/components/system/roles/RolePermissionsDialog.vue'
import RolesTable from '@/components/system/roles/RolesTable.vue'
import { PermissionsApi, RolesApi } from '@/utils/services'
import type { Role } from '@/utils/types/models'
import { computed, onMounted, ref } from 'vue'

const search = ref('')
const loading = ref(false)
const roleLoading = ref(false)
const roles = ref<Role[]>([])
const permissions = ref<any[]>([])

const fetchAll = async () => {
  loading.value = true
  try {
    const [rs, ps] = await Promise.all([
      RolesApi.list(),
      PermissionsApi.list(),
    ])
    roles.value = rs
    permissions.value = ps
  } finally {
    loading.value = false
  }
}

onMounted(fetchAll)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return roles.value
  return roles.value.filter(r => String(r.nom).toLowerCase().includes(q))
})

const dialog = ref(false)
const dialogMode = ref<'assign' | 'revoke' | 'both'>('both')
const selectedRole = ref<Role | null>(null)

const openAssign = (r: Role) => { selectedRole.value = r; dialogMode.value = 'assign'; dialog.value = true }
const openRevoke = (r: Role) => { selectedRole.value = r; dialogMode.value = 'revoke'; dialog.value = true }

const assign = async ({ roleId, permission_ids }: { roleId: number; permission_ids: number[] }) => {
  roleLoading.value = true
  try {
    await RolesApi.assignPermissions(roleId, permission_ids)
    await fetchAll()
  } finally {
    roleLoading.value = false
  }
}

const revoke = async ({ roleId, permission_ids }: { roleId: number; permission_ids: number[] }) => {
  roleLoading.value = true
  try {
    await RolesApi.revokePermissions(roleId, permission_ids)
    await fetchAll()
  } finally {
    roleLoading.value = false
  }
}
</script>

<template>
  <div>
    <VCard class="mb-4">
      <VCardText class="d-flex flex-wrap align-center gap-4">
        <VTextField
          v-model="search"
          placeholder="Rechercher un rôle"
          prepend-inner-icon="ri-search-line"
          hide-details
          density="comfortable"
          class="flex-grow-1"
        />
      </VCardText>
    </VCard>

    <RolesTable :items="filtered" :loading="loading" @assign-perms="openAssign" @revoke-perms="openRevoke" />

    <RolePermissionsDialog
      v-model="dialog"
      :role="selectedRole"
      :all-permissions="permissions"
      :loading="roleLoading"
      :mode="dialogMode"
      @assign="assign"
      @revoke="revoke"
    />
  </div>
</template>

