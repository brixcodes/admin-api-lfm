<script setup lang="ts">
import type { UtilisateurLight } from '@/utils/types/models'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  users: UtilisateurLight[]
  searchQuery: string
  loading?: boolean
}

interface Emits {
  (e: 'update:searchQuery', value: string): void
  (e: 'filter-change', filters: FilterState): void
}

interface FilterState {
  status: string[]
  gender: string[]
  role: string[]
  permissions: string[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

// Filter states
const selectedStatus = ref<string[]>([])
const selectedGender = ref<string[]>([])
const selectedRole = ref<string[]>([])
const selectedPermissions = ref<string[]>([])

// Computed filter options from actual data
const statusOptions = computed(() => {
  const statuses = new Set<string>()
  props.users.forEach(user => {
    const status = user.statut === 'actif' && user.est_actif ? 'active' : 'inactive'
    statuses.add(status)
  })

  return Array.from(statuses).map(status => ({
    title: t(`system.users.status.${status}`),
    value: status
  }))
})

const genderOptions = computed(() => {
  const genders = new Set<string>()
  props.users.forEach(user => {
    genders.add(user.sexe)
  })

  return Array.from(genders).map(gender => ({
    title: t(`system.users.gender.${gender}`),
    value: gender
  }))
})

const roleOptions = computed(() => {
  const roles = new Set<string>()
  props.users.forEach(user => {
    if (user.role) {
      roles.add(user.role.nom)
    }
  })

  return Array.from(roles).map(role => ({
    title: t(`system.roles.labels.${role}`),
    value: role
  }))
})

const permissionOptions = computed(() => {
  const permissions = new Set<string>()
  props.users.forEach(user => {
    // Permissions directes de l'utilisateur
    user.permissions?.forEach(perm => {
      permissions.add(perm.nom)
    })

    // Permissions du rôle de l'utilisateur
    user.role?.permissions?.forEach(perm => {
      permissions.add(perm.nom)
    })
  })

  return Array.from(permissions).map(perm => ({
    title: perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: perm
  }))
})

// Watch for filter changes and emit
watch([selectedStatus, selectedGender, selectedRole, selectedPermissions], () => {
  emit('filter-change', {
    status: selectedStatus.value,
    gender: selectedGender.value,
    role: selectedRole.value,
    permissions: selectedPermissions.value
  })
}, { deep: true })

// Clear all filters
const clearAllFilters = () => {
  selectedStatus.value = []
  selectedGender.value = []
  selectedRole.value = []
  selectedPermissions.value = []
}

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return selectedStatus.value.length > 0 ||
    selectedGender.value.length > 0 ||
    selectedRole.value.length > 0 ||
    selectedPermissions.value.length > 0
})
</script>

<template>
  <VRow class="mb-4">
    <!-- <VCol cols="12" md="3">
      <VTextField :model-value="searchQuery" @update:model-value="emit('update:searchQuery', $event)"
        :placeholder="t('system.users.search')" prepend-inner-icon="ri-search-line" variant="outlined" density="compact"
        clearable :loading="loading" />
    </VCol> -->

    <!-- Status Filter -->
    <VCol cols="12" md="3">
      <VSelect v-model="selectedStatus" :label="t('system.users.filters.status')" :items="statusOptions"
        variant="outlined" density="compact" multiple chips clearable :loading="loading" />
    </VCol>

    <!-- Gender Filter -->
    <VCol cols="12" md="3">
      <VSelect v-model="selectedGender" :label="t('system.users.filters.gender')" :items="genderOptions"
        variant="outlined" density="compact" multiple chips clearable :loading="loading" />
    </VCol>

    <!-- Role Filter -->
    <VCol cols="12" md="3">
      <VSelect v-model="selectedRole" :label="t('system.users.filters.role')" :items="roleOptions" variant="outlined"
        density="compact" multiple chips clearable :loading="loading" />
    </VCol>

    <!-- Permissions Filter -->
    <VCol cols="12" md="3">
      <VSelect v-model="selectedPermissions" :label="t('system.users.filters.permissions')" :items="permissionOptions"
        variant="outlined" density="compact" multiple chips clearable :loading="loading" />
    </VCol>

    <!-- Clear Filters
    <VCol cols="12" md="1" class="d-flex align-center">
      <VBtn v-if="hasActiveFilters" icon variant="outlined" color="error" size="small" @click="clearAllFilters">
        <VIcon icon="ri-close-line" />
        <VTooltip activator="parent">
          {{ t('system.users.filters.clear_all') }}
        </VTooltip>
      </VBtn>
    </VCol> -->
  </VRow>
</template>
