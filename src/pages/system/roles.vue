<script setup lang="ts">
import RolePermissionsDialog from '@/components/system/roles/RolePermissionsDialog.vue'
import RolesStats from '@/components/system/roles/RolesStats.vue'
import RolesTable from '@/components/system/roles/RolesTable.vue'
import { PermissionsApi, RolesApi } from '@/utils/services'
import type { Role } from '@/utils/types/models'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const search = ref('')
const loading = ref(false)
const roleLoading = ref(false)
const roles = ref<Role[]>([])
const permissions = ref<any[]>([])

// Notification snackbar top-right
const showSnack = ref(false)
const snackMsg = ref('')
const snackColor = ref<'success' | 'error' | 'info' | 'warning'>('success')

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

// Confirmation state
const confirmDialog = ref(false)
const confirmAction = ref<'assign' | 'revoke' | null>(null)
const pendingPayload = ref<{ roleId: number; permission_ids: number[] } | null>(null)

function requestConfirm(action: 'assign' | 'revoke', payload: { roleId: number; permission_ids: number[] }) {
  confirmAction.value = action
  pendingPayload.value = payload
  confirmDialog.value = true
}

async function onConfirmYes() {
  if (!confirmAction.value || !pendingPayload.value) return
  roleLoading.value = true
  try {
    if (confirmAction.value === 'assign') await RolesApi.assignPermissions(pendingPayload.value.roleId, pendingPayload.value.permission_ids)
    else await RolesApi.revokePermissions(pendingPayload.value.roleId, pendingPayload.value.permission_ids)

    await fetchAll()
    dialog.value = false
    snackMsg.value = confirmAction.value === 'assign' ? t('system.roles.notifications.assignSuccess') : t('system.roles.notifications.revokeSuccess')
    snackColor.value = 'success'
    showSnack.value = true
  } catch (e: any) {
    snackMsg.value = e?.message || t('common.error')
    snackColor.value = 'error'
    showSnack.value = true
  } finally {
    roleLoading.value = false
    confirmDialog.value = false
    confirmAction.value = null
    pendingPayload.value = null
  }
}

function onConfirmNo() {
  confirmDialog.value = false
  confirmAction.value = null
  pendingPayload.value = null
}

const assign = (payload: { roleId: number; permission_ids: number[] }) => requestConfirm('assign', payload)
const revoke = (payload: { roleId: number; permission_ids: number[] }) => requestConfirm('revoke', payload)
</script>

<template>
  <div>
    <VCard class="mb-4">
      <VCardTitle class="d-flex align-center justify-space-between flex-wrap gap-3">
        <div class="d-flex align-center gap-2">
          <VIcon icon="ri-shield-keyhole-line" />
          <span>{{ $t('system.roles.title') }}</span>
        </div>
      </VCardTitle>
      <VCardText class="d-flex flex-wrap align-center gap-4">
        <VTextField
          v-model="search"
          :placeholder="$t('system.roles.search') || 'Rechercher un rôle'"
          prepend-inner-icon="ri-search-line"
          hide-details
          density="comfortable"
          class="flex-grow-1"
        />
      </VCardText>
    </VCard>

    <!-- Stats cards -->
    <RolesStats class="mb-4" :roles="roles" :loading="loading" />

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

    <!-- Confirmation dialog -->
    <VDialog v-model="confirmDialog" max-width="480">
      <VCard>
        <VCardTitle class="text-h6">{{ confirmAction === 'assign' ? $t('system.roles.confirm.assignTitle') : $t('system.roles.confirm.revokeTitle') }}</VCardTitle>
        <VCardText>
          {{ confirmAction === 'assign' ? $t('system.roles.confirm.assignMessage') : $t('system.roles.confirm.revokeMessage') }}
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="outlined" color="grey" @click="onConfirmNo">{{ $t('common.cancel') }}</VBtn>
          <VBtn :color="confirmAction === 'assign' ? 'primary' : 'error'" :loading="roleLoading" @click="onConfirmYes">
            {{ confirmAction === 'assign' ? $t('system.roles.actions.assign') : $t('system.roles.actions.revoke') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Top-right snackbar -->
    <VSnackbar v-model="showSnack" location="top right" :color="snackColor" timeout="3000">
      {{ snackMsg }}
    </VSnackbar>
  </div>
</template>
