<script setup lang="ts">
import UserCreateDialog from '@/components/system/users/UserCreateDialog.vue'
import UserDetailsDialog from '@/components/system/users/UserDetailsDialog.vue'
import UserEditDialog from '@/components/system/users/UserEditDialog.vue'
import UserPermissionsDialog from '@/components/system/users/UserPermissionsDialog.vue'
import UsersFilters from '@/components/system/users/UsersFilters.vue'
import UsersStats from '@/components/system/users/UsersStats.vue'
import UsersTable from '@/components/system/users/UsersTable.vue'
import { PermissionsApi, RolesApi, UsersApi } from '@/utils/services'
import type { PermissionLight, RoleLight, UtilisateurLight } from '@/utils/types/models'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// États
const users = ref<UtilisateurLight[]>([])
const roles = ref<RoleLight[]>([])
const permissions = ref<PermissionLight[]>([])
const isLoading = ref(false)
const isLoadingPermissions = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')

// Dialog states
const showDetailsDialog = ref(false)
const showEditDialog = ref(false)
const showCreateDialog = ref(false)
const showPermissionsDialog = ref(false)
const showConfirmDialog = ref(false)
const selectedUser = ref<UtilisateurLight | null>(null)
const permissionsMode = ref<'assign' | 'revoke' | 'both'>('both')

// Notification state
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error'>('success')

// Confirmation state
const confirmAction = ref<'assign' | 'revoke' | 'status' | 'delete' | 'edit'>('assign')
const confirmData = ref<any>(null)

// Filter state
interface FilterState {
  status: string[]
  gender: string[]
  role: string[]
  permissions: string[]
}

const activeFilters = ref<FilterState>({
  status: [],
  gender: [],
  role: [],
  permissions: []
})

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value

  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.nom.toLowerCase().includes(query) ||
      user.prenom?.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role?.nom.toLowerCase().includes(query)
    )
  }

  // Apply status filter
  if (activeFilters.value.status.length > 0) {
    filtered = filtered.filter(user => {
      const status = user.statut === 'actif' && user.est_actif ? 'active' : 'inactive'
      return activeFilters.value.status.includes(status)
    })
  }

  // Apply gender filter
  if (activeFilters.value.gender.length > 0) {
    filtered = filtered.filter(user =>
      activeFilters.value.gender.includes(user.sexe)
    )
  }

  // Apply role filter
  if (activeFilters.value.role.length > 0) {
    filtered = filtered.filter(user =>
      user.role && activeFilters.value.role.includes(user.role.nom)
    )
  }

  // Apply permissions filter
  if (activeFilters.value.permissions.length > 0) {
    filtered = filtered.filter(user => {
      // Vérifier les permissions directes de l'utilisateur
      const hasDirectPermission = user.permissions?.some(perm =>
        activeFilters.value.permissions.includes(perm.nom)
      )

      // Vérifier les permissions du rôle de l'utilisateur
      const hasRolePermission = user.role?.permissions?.some(perm =>
        activeFilters.value.permissions.includes(perm.nom)
      )

      return hasDirectPermission || hasRolePermission
    })
  }

  return filtered
})

// Fetch functions
const fetchUsers = async () => {
  isLoading.value = true
  error.value = null

  try {
    users.value = await UsersApi.list({ skip: 0, limit: 100 })
  } catch (err: any) {
    error.value = err.message || t('system.users.errors.fetch_failed')
    console.error('Erreur lors de la récupération des utilisateurs:', err)
  } finally {
    isLoading.value = false
  }
}

const fetchRoles = async () => {
  try {
    roles.value = await RolesApi.list({ skip: 0, limit: 100 })
  } catch (err: any) {
    console.error('Erreur lors de la récupération des rôles:', err)
  }
}

const fetchPermissions = async () => {
  isLoadingPermissions.value = true
  try {
    const result = await PermissionsApi.list({ skip: 0, limit: 100 })
    permissions.value = result as PermissionLight[]
  } catch (err: any) {
    console.error('Erreur lors de la récupération des permissions:', err)
  } finally {
    isLoadingPermissions.value = false
  }
}

const fetchAllData = async () => {
  isLoading.value = true
  try {
    await Promise.all([
      fetchUsers(),
      fetchRoles()
      // Les permissions seront chargées à la demande
    ])
  } finally {
    isLoading.value = false
  }
}

// Filter handlers
const handleFilterChange = (filters: FilterState) => {
  activeFilters.value = filters
}

// Dialog handlers
const handleViewUser = (user: UtilisateurLight) => {
  selectedUser.value = user
  showDetailsDialog.value = true
}

const handleEditUser = (user: UtilisateurLight) => {
  selectedUser.value = user
  showEditDialog.value = true
}

const handleAssignPermissions = (user: UtilisateurLight) => {
  selectedUser.value = user
  permissionsMode.value = 'assign'
  showPermissionsDialog.value = true
  // Charger les permissions si elles ne sont pas encore chargées
  if (permissions.value.length === 0) {
    fetchPermissions()
  }
}

const handleRevokePermissions = (user: UtilisateurLight) => {
  selectedUser.value = user
  permissionsMode.value = 'revoke'
  showPermissionsDialog.value = true
  // Charger les permissions si elles ne sont pas encore chargées
  if (permissions.value.length === 0) {
    fetchPermissions()
  }
}

const handleChangeStatus = (user: UtilisateurLight) => {
  selectedUser.value = user
  confirmAction.value = 'status'
  confirmData.value = {
    newStatus: user.statut === 'actif' ? 'inactif' : 'actif'
  }
  showConfirmDialog.value = true
}

// Permission assignment/revocation
const onAssignPermissions = async (payload: { userId: number; permission_ids: number[] }) => {
  confirmAction.value = 'assign'
  confirmData.value = payload
  showPermissionsDialog.value = false
  showConfirmDialog.value = true
}

const onRevokePermissions = async (payload: { userId: number; permission_ids: number[] }) => {
  confirmAction.value = 'revoke'
  confirmData.value = payload
  showPermissionsDialog.value = false
  showConfirmDialog.value = true
}

// User update
const onSaveUser = async (payload: { userId: number; data: any }) => {
  confirmAction.value = 'edit'
  confirmData.value = payload
  showEditDialog.value = false
  showConfirmDialog.value = true
}

// User creation
const onCreateUser = async (userData: any) => {
  try {
    isLoading.value = true
    await UsersApi.create(userData)

    // Show success notification
    notificationMessage.value = t('system.users.notifications.created_success')
    notificationType.value = 'success'
    showNotification.value = true

    // Refresh data
    await fetchAllData()
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    notificationMessage.value = error.response?.data?.detail || t('system.users.notifications.created_error')
    notificationType.value = 'error'
    showNotification.value = true
  } finally {
    isLoading.value = false
  }
}





// Confirmation handler
const onConfirmYes = async () => {
  try {
    switch (confirmAction.value) {
      case 'assign':
        await UsersApi.assignPermissions(confirmData.value.userId, confirmData.value.permission_ids)
        notificationMessage.value = t('system.users.notifications.assign_success')
        break
      case 'revoke':
        await UsersApi.revokePermissions(confirmData.value.userId, confirmData.value.permission_ids)
        notificationMessage.value = t('system.users.notifications.revoke_success')
        break
      case 'status':
        await UsersApi.changeStatus(selectedUser.value!.id, confirmData.value.newStatus)
        notificationMessage.value = t('system.users.notifications.status_success')
        break
      case 'edit':
        await UsersApi.update(confirmData.value.userId, confirmData.value.data)
        notificationMessage.value = t('system.users.notifications.update_success')
        break
    }

    await fetchUsers()
    showConfirmDialog.value = false
    showNotification.value = true
    notificationType.value = 'success'
  } catch (err: any) {
    showNotification.value = true
    notificationMessage.value = err.message || t('system.users.notifications.action_error')
    notificationType.value = 'error'
    showConfirmDialog.value = false
  }
}

// Charger les données au montage
onMounted(() => {
  fetchAllData()
})
</script>

<template>
  <div>
    <!-- Statistics -->
    <UsersStats :users="users" :loading="isLoading" class="mb-1" />
    <VCard class="pa-3 mb-2">
      <div class="d-flex gap-3">
        <VTextField v-model="searchQuery" :placeholder="t('system.users.search')" prepend-inner-icon="ri-search-line"
          variant="outlined" density="compact" style="min-inline-size: 300px;" clearable />

        <VBtn color="primary" variant="outlined" @click="fetchAllData" :loading="isLoading"
          prepend-icon="ri-refresh-line">
          {{ t('common.refresh') }}
        </VBtn>

        <VBtn color="primary" variant="flat" @click="showCreateDialog = true" prepend-icon="ri-user-add-line">
          {{ t('system.users.add') }}
        </VBtn>
      </div>
    </VCard>
    <!-- Users Table -->
    <VCard>
      <VCardText>
        <!-- Filters -->
        <UsersFilters :users="users" :search-query="searchQuery" :loading="isLoading"
          @update:search-query="searchQuery = $event" @filter-change="handleFilterChange" />

        <!-- Table -->
        <UsersTable :users="filteredUsers" :loading="isLoading" @view-user="handleViewUser" @edit-user="handleEditUser"
          @assign-perms="handleAssignPermissions" @revoke-perms="handleRevokePermissions"
          @change-status="handleChangeStatus" />
      </VCardText>
    </VCard>



    <!-- User Details Dialog -->
    <UserDetailsDialog v-model="showDetailsDialog" :user="selectedUser" @edit-user="handleEditUser"
      @assign-perms="handleAssignPermissions" @revoke-perms="handleRevokePermissions" />

    <!-- User Edit Dialog -->
    <UserEditDialog v-model="showEditDialog" :user="selectedUser" :roles="roles" :loading="isLoading"
      @save="onSaveUser" />

    <!-- User Create Dialog -->
    <UserCreateDialog v-model="showCreateDialog" :roles="roles" @created="onCreateUser" />

    <!-- User Permissions Dialog -->
    <UserPermissionsDialog v-model="showPermissionsDialog" :user="selectedUser" :all-permissions="permissions"
      :mode="permissionsMode" :loading="isLoadingPermissions" @assign="onAssignPermissions"
      @revoke="onRevokePermissions" />

    <!-- Confirmation Dialog -->
    <VDialog v-model="showConfirmDialog" max-width="420" persistent>
      <VCard class="pa-4 rounded-lg">
        <!-- Header -->
        <VCardTitle class="d-flex align-center pb-2">
          <VAvatar size="40" :color="confirmAction === 'assign' ? 'green-lighten-4' :
            confirmAction === 'revoke' ? 'red-lighten-4' :
              confirmAction === 'edit' ? 'orange-lighten-4' : 'blue-lighten-4'" variant="tonal" class="me-3">
            <VIcon size="24" :color="confirmAction === 'assign' ? 'green-darken-2' :
              confirmAction === 'revoke' ? 'red-darken-2' :
                confirmAction === 'edit' ? 'orange-darken-2' : 'blue-darken-2'" :icon="confirmAction === 'assign' ? 'ri-shield-check-line' :
                  confirmAction === 'revoke' ? 'ri-shield-cross-line' :
                    confirmAction === 'edit' ? 'ri-edit-line' : 'ri-user-settings-line'" />
          </VAvatar>
          <span class="text-h6 font-weight-bold">
            {{ t(`system.users.confirm.${confirmAction}_title`) }}
          </span>
        </VCardTitle>

        <!-- Content -->
        <VCardText class="pt-1">
          <p class="mb-4 text-body-2 text-medium-emphasis">
            {{ t(`system.users.confirm.${confirmAction}_message`) }}
          </p>

          <div v-if="selectedUser" class="d-flex align-center">
            <VAvatar size="40" color="primary" variant="tonal" class="me-3">
              <span class="text-sm font-weight-medium">
                {{ `${selectedUser.prenom?.[0] || ''}${selectedUser.nom[0]}`.toUpperCase() }}
              </span>
            </VAvatar>
            <div>
              <div class="font-weight-medium">{{ `${selectedUser.prenom || ''} ${selectedUser.nom}`.trim() }}</div>
              <div class="text-caption text-medium-emphasis">{{ selectedUser.email }}</div>
            </div>
          </div>
        </VCardText>

        <!-- Actions -->
        <VCardActions class="justify-end pt-3">
          <VBtn variant="outlined" color="error" class="" @click="showConfirmDialog = false">
            {{ t('common.cancel') }}
          </VBtn>
          <VBtn class="" variant="flat" :color="confirmAction === 'revoke' ? 'warning' : 'primary'"
            @click="onConfirmYes">
            {{ t('common.confirm') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>


    <!-- Notification -->
    <VSnackbar v-model="showNotification" :color="notificationType" location="top right" timeout="4000">
      {{ notificationMessage }}
      <template #actions>
        <VBtn icon="ri-close-line" @click="showNotification = false" />
      </template>
    </VSnackbar>
  </div>
</template>
