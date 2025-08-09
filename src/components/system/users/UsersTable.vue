<script setup lang="ts">
import type { UtilisateurLight } from '@/utils/types/models'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UsersTableSkeleton from './UsersTableSkeleton.vue'

interface Props {
  users: UtilisateurLight[]
  loading?: boolean
  searchQuery?: string
}

interface Emits {
  (e: 'view-user', user: UtilisateurLight): void
  (e: 'edit-user', user: UtilisateurLight): void
  (e: 'assign-perms', user: UtilisateurLight): void
  (e: 'revoke-perms', user: UtilisateurLight): void
  (e: 'change-status', user: UtilisateurLight): void
  (e: 'delete-user', user: UtilisateurLight): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  searchQuery: ''
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

// Table headers
const headers = computed(() => [
  { title: t('system.users.table.user'), key: 'fullName', sortable: true },
  { title: t('system.users.table.gender'), key: 'sexe', sortable: true },
  { title: t('system.users.table.role'), key: 'role', sortable: true },
  { title: t('system.users.table.status'), key: 'status', sortable: true },
  { title: t('system.users.table.created'), key: 'created_at', sortable: true },
  { title: t('system.users.table.actions'), key: 'actions', sortable: false }
])

// Filtered users based on search
const filteredUsers = computed(() => {
  if (!props.searchQuery) return props.users

  const query = props.searchQuery.toLowerCase()
  return props.users.filter(user =>
    user.nom.toLowerCase().includes(query) ||
    user.prenom?.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.role?.nom.toLowerCase().includes(query)
  )
})

// Helper functions
const getFullName = (user: UtilisateurLight) => {
  return `${user.prenom || ''} ${user.nom}`.trim()
}

const getAvatarText = (name: string) => {
  const words = name.split(' ')
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const getStatusColor = (user: UtilisateurLight) => {
  if (user.statut === 'actif' && user.est_actif) return 'success'
  if (user.statut === 'inactif' || !user.est_actif) return 'error'
  return 'warning'
}

const getStatusText = (user: UtilisateurLight) => {
  if (user.statut === 'actif' && user.est_actif) return t('system.users.status.active')
  if (user.statut === 'inactif' || !user.est_actif) return t('system.users.status.inactive')
  return t('system.users.status.suspended')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}




</script>

<template>
  <!-- Loading skeleton -->
  <UsersTableSkeleton v-if="loading" :rows="8" />

  <!-- Data table -->
  <VDataTable v-else :headers="headers" :items="filteredUsers" :items-per-page="10" class="text-no-wrap"
    :no-data-text="t('system.users.table.no_data')">
    <!-- User column with avatar and info -->
    <template #item.fullName="{ item }">
      <div class="d-flex align-center">
        <VAvatar size="38" :color="getStatusColor(item)" variant="tonal" class="me-3">
          <span class="text-sm font-weight-medium">{{ getAvatarText(getFullName(item)) }}</span>
        </VAvatar>
        <div class="d-flex flex-column">
          <h6 class="text-h6 font-weight-medium">
            {{ getFullName(item) }}
          </h6>
          <span class="text-sm text-medium-emphasis">{{ item.email }}</span>
        </div>
      </div>
    </template>

    <!-- Gender column -->
    <!-- Gender column -->
    <template #item.sexe="{ item }">
      <VChip size="small" variant="outlined" :color="item.sexe === 'homme' ? 'blue' : 'pink'">
        <VIcon start :icon="item.sexe === 'homme' ? 'ri-men-line' : 'ri-women-line'" />
        {{ t(`system.users.gender.${item.sexe}`) }}
      </VChip>
    </template>

    <!-- Role column -->
    <template #item.role="{ item }">
      <div v-if="item.role" class="d-flex align-center">
        <VChip :color="item.role.nom === 'admin' ? 'error' : 'primary'" size="small" variant="tonal">
          {{ t(`system.roles.labels.${item.role.nom}`) }}
        </VChip>
      </div>
      <span v-else class="text-disabled">{{ t('system.users.no_role') }}</span>
    </template>



    <!-- Status column -->
    <template #item.status="{ item }">
      <VChip :color="getStatusColor(item)" size="small" variant="tonal">
        {{ getStatusText(item) }}
      </VChip>
    </template>

    <!-- Created date column -->
    <template #item.created_at="{ item }">
      <span class="text-body-2">{{ formatDate(item.created_at) }}</span>
    </template>

    <!-- Actions column -->
    <template #item.actions="{ item }">
      <div class="d-flex gap-1">
        <VTooltip>
          <template #activator="{ props: tooltipProps }">
            <VBtn v-bind="tooltipProps" size="small" variant="tonal" color="info" icon @click="emit('view-user', item)">
              <VIcon icon="ri-eye-line" />
            </VBtn>
          </template>
          {{ t('system.users.actions.view') }}
        </VTooltip>

        <VTooltip>
          <template #activator="{ props: tooltipProps }">
            <VBtn v-bind="tooltipProps" size="small" variant="tonal" color="primary" icon
              @click="emit('edit-user', item)">
              <VIcon icon="ri-edit-line" />
            </VBtn>
          </template>
          {{ t('system.users.actions.edit') }}
        </VTooltip>

        <VTooltip>
          <template #activator="{ props: tooltipProps }">
            <VBtn v-bind="tooltipProps" size="small" variant="tonal" color="success" icon
              @click="emit('assign-perms', item)">
              <VIcon icon="ri-shield-check-line" />
            </VBtn>
          </template>
          {{ t('system.users.actions.assign_permissions') }}
        </VTooltip>

        <VTooltip>
          <template #activator="{ props: tooltipProps }">
            <VBtn v-bind="tooltipProps" size="small" variant="tonal" color="warning" icon
              @click="emit('revoke-perms', item)">
              <VIcon icon="ri-shield-cross-line" />
            </VBtn>
          </template>
          {{ t('system.users.actions.revoke_permissions') }}
        </VTooltip>

        <VTooltip>
          <template #activator="{ props: tooltipProps }">
            <VBtn v-bind="tooltipProps" size="small" variant="tonal"
              :color="getStatusColor(item) === 'success' ? 'error' : 'success'" icon
              @click="emit('change-status', item)">
              <VIcon :icon="getStatusColor(item) === 'success' ? 'ri-user-forbid-line' : 'ri-user-check-line'" />
            </VBtn>
          </template>
          {{ getStatusColor(item) === 'success' ? t('system.users.actions.deactivate') :
            t('system.users.actions.activate') }}
        </VTooltip>
      </div>
    </template>
  </VDataTable>
</template>
