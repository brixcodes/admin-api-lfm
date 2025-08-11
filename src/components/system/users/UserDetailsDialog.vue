<script setup lang="ts">
import type { UtilisateurLight } from '@/utils/types/models'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  modelValue: boolean
  user?: UtilisateurLight | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'edit-user', user: UtilisateurLight): void
  (e: 'assign-perms', user: UtilisateurLight): void
  (e: 'revoke-perms', user: UtilisateurLight): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

// Active tab
const activeTab = ref('overview')

// Computed properties
const fullName = computed(() => {
  if (!props.user) return ''
  return `${props.user.prenom || ''} ${props.user.nom}`.trim()
})

const avatarText = computed(() => {
  if (!props.user) return ''
  const name = fullName.value
  const words = name.split(' ')
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const statusColor = computed(() => {
  if (!props.user) return 'grey'
  if (props.user.statut === 'actif' && props.user.est_actif) return 'success'
  if (props.user.statut === 'inactif' || !props.user.est_actif) return 'error'
  return 'warning'
})

const statusText = computed(() => {
  if (!props.user) return ''
  if (props.user.statut === 'actif' && props.user.est_actif) return t('system.users.status.active')
  if (props.user.statut === 'inactif' || !props.user.est_actif) return t('system.users.status.inactive')
  return t('system.users.status.suspended')
})

const totalPermissions = computed(() => {
  if (!props.user) return 0
  const rolePermissions = props.user.role?.permissions?.length || 0
  const directPermissions = props.user.permissions?.length || 0
  return rolePermissions + directPermissions
})

// Calculate age from birth date
const userAge = computed(() => {
  if (!props.user?.date_naissance) return null

  const birthDate = new Date(props.user.date_naissance)
  const today = new Date()

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('fr-FR')
}

const toTitle = (str: string) => {
  return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const closeDialog = () => {
  emit('update:modelValue', false)
}

</script>

<template>
  <VDialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="900" scrollable>
    <VCard v-if="user" class="user-details-dialog">
      <VCardText class="pa-0">
        <VRow no-gutters>
          <!-- Left Panel - User Profile -->
          <VCol cols="12" md="6" class="bg-variant">
            <div class="pa-6 text-center">
              <!-- User Avatar -->
              <VAvatar size="120" :color="statusColor" variant="tonal" class="mb-4">
                <span class="text-h3 font-weight-bold">{{ avatarText }}</span>
              </VAvatar>

              <!-- User Name -->
              <h4 class="text-h4 mb-2">{{ fullName }}</h4>

              <!-- User Role Badge -->
              <VChip v-if="user.role" :color="user.role.nom === 'admin' ? 'error' : 'primary'" size="small"
                variant="flat" class="mb-4">
                {{ t(`system.roles.labels.${user.role.nom}`) }}
              </VChip>
              <div v-else class="mb-4">
                <VChip color="secondary" size="small" variant="outlined">
                  {{ t('system.users.no_role') }}
                </VChip>
              </div>


              <!-- User Details -->
              <div class="text-start mb-6">
                <h6 class="text-h6 mb-3">{{ t('system.users.details.details_title') }}</h6>

                <div class="mb-3">
                  <span class="text-caption text-medium-emphasis mr-2">{{ t('system.users.details.username') }}</span>
                  <span class="font-weight-medium">@{{ user.nom.toLowerCase() }}</span>
                </div>

                <div class="mb-3">
                  <span class="text-caption text-medium-emphasis mr-2">{{ t('system.users.details.email') }}</span>
                  <span class="font-weight-medium">{{ user.email }}</span>
                </div>

                <div class="mb-3">
                  <span class="text-caption text-medium-emphasis mr-2">{{ t('system.users.details.gender') }}</span>
                  <VChip size="x-small" variant="outlined" :color="user.sexe === 'homme' ? 'blue' : 'pink'">
                    <VIcon start :icon="user.sexe === 'homme' ? 'ri-men-line' : 'ri-women-line'" />
                    {{ t(`system.users.gender.${user.sexe}`) }}
                  </VChip>
                </div>

                <div class="mb-3" v-if="user.date_naissance">
                  <span class="text-caption text-medium-emphasis mr-2">{{ t('system.users.details.birth_date') }}</span>
                  <span class="font-weight-medium">{{ formatDate(user.date_naissance) }}</span>
                  <VChip v-if="userAge !== null" size="x-small" variant="outlined" color="info" class="ml-2">
                    {{ userAge }} {{ t('system.users.details.years_old') }}
                  </VChip>
                </div>

                <div class="mb-3">
                  <span class="text-caption text-medium-emphasis mr-2">{{ t('system.users.details.status') }} : </span>
                  <VChip :color="statusColor" size="x-small" variant="tonal">
                    {{ statusText }}
                  </VChip>
                </div>

                <div class="mb-3">
                  <span class="text-caption text-medium-emphasis mr-2">{{ t('system.users.details.created_at') }}</span>
                  <span class="font-weight-medium">{{ formatDateTime(user.created_at) }}</span>
                </div>

                <div class="mb-3" v-if="user.telephone">
                  <span class="text-caption text-medium-emphasis mr-2">{{ t('system.users.details.phone') }}</span>
                  <span class="font-weight-medium">{{ user.telephone }}</span>
                </div>
                <div class="mb-3" v-if="user.nationalite">
                  <span class="text-caption text-medium-emphasis mr-2">{{ t('system.users.details.nationality')
                    }}</span>
                  <span class="font-weight-medium">{{ user.nationalite }}</span>
                </div>
                <div class="mb-3" v-if="user.pays">
                  <span class="text-caption text-medium-emphasis mr-2">{{ t('system.users.details.country') }}</span>
                  <span class="font-weight-medium">{{ user.pays }}</span>
                </div>
                <div class="mb-3" v-if="user.region">
                  <span class="text-caption text-medium-emphasis mr-2">{{ t('system.users.details.region') }}</span>
                  <span class="font-weight-medium">{{ user.region }}</span>
                </div>
                <div class="mb-3" v-if="user.ville">
                  <span class="text-caption text-medium-emphasis mr-2">{{ t('system.users.details.city') }}</span>
                  <span class="font-weight-medium">{{ user.ville }}</span>
                </div>
                <div class="mb-3" v-if="user.adresse">
                  <span class="text-caption text-medium-emphasis mr-2">{{ t('system.users.details.address') }}</span>
                  <span class="font-weight-medium">{{ user.adresse }}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex flex-row gap-2">
                <VBtn color="primary" variant="flat" @click="emit('edit-user', user)">
                  <VIcon start icon="ri-edit-line" />
                  {{ t('system.users.actions.edit') }}
                </VBtn>

                <VBtn color="success" variant="outlined" @click="emit('assign-perms', user)">
                  <VIcon start icon="ri-shield-check-line" />
                  {{ t('system.users.actions.assign_permissions') }}
                </VBtn>

                <VBtn color="warning" variant="outlined" @click="emit('revoke-perms', user)">
                  <VIcon start icon="ri-shield-cross-line" />
                  {{ t('system.users.actions.revoke_permissions') }}
                </VBtn>
              </div>

            </div>
          </VCol>

          <!-- Right Panel - Tabbed Content -->
          <VCol cols="12" md="6">

            <!-- Close Button -->
            <div class="d-flex justify-end mb-4 pa-3">
              <VBtn icon variant="text" size="small" @click="closeDialog">
                <VIcon icon="ri-close-line" />
              </VBtn>
            </div>

            <div class="pa-6">
              <!-- Tab Navigation -->
              <VTabs v-model="activeTab" class="mb-6" color="primary">
                <VTab value="permissions">
                  <VIcon start icon="ri-shield-line" />
                  {{ t('system.users.details.tabs.permissions') }}
                </VTab>
              </VTabs>

              <!-- Tab Content -->
              <VWindow v-model="activeTab">
                <!-- Permissions Tab -->
                <VWindowItem value="permissions">
                  <div v-if="user.permissions?.length">
                    <h6 class="text-h6 mb-4">{{ t('system.users.details.direct_permissions') }}</h6>
                    <div class="d-flex flex-wrap gap-2">
                      <VChip v-for="perm in user.permissions" :key="perm.id" size="small" color="success"
                        variant="outlined">
                        {{perm.nom.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}}
                      </VChip>
                    </div>
                  </div>
                  <div v-else>
                    <VAlert type="info" variant="tonal">
                      {{ t('system.users.details.no_permissions') }}
                    </VAlert>
                  </div>
                </VWindowItem>
              </VWindow>

            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped>
.user-details-dialog .border-e {
  border-inline-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
