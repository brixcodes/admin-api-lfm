<script setup lang="ts">
import type { PermissionLight, UtilisateurLight } from '@/utils/types/models'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import PermissionsSkeleton from './PermissionsSkeleton.vue'

interface Props {
  modelValue: boolean
  user?: UtilisateurLight | null
  allPermissions: PermissionLight[]
  mode?: 'assign' | 'revoke' | 'both'
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'assign', payload: { userId: number; permission_ids: number[] }): void
  (e: 'revoke', payload: { userId: number; permission_ids: number[] }): void
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'both',
  loading: false
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

// Local state
const selectedAssign = ref<number[]>([])
const selectedRevoke = ref<number[]>([])
const activeTab = ref('assign')

// Computed properties
const assignedIds = computed(() => new Set((props.user?.permissions || []).map(p => p.id)))
const availableToAssign = computed(() => props.allPermissions.filter(p => !assignedIds.value.has(p.id)))
const availableToRevoke = computed(() => props.allPermissions.filter(p => assignedIds.value.has(p.id)))

const canAssign = computed(() => selectedAssign.value.length > 0)
const canRevoke = computed(() => selectedRevoke.value.length > 0)

const selectedAssignIds = computed(() => selectedAssign.value.map(v => Number(v)).filter(v => Number.isFinite(v)))
const selectedRevokeIds = computed(() => selectedRevoke.value.map(v => Number(v)).filter(v => Number.isFinite(v)))

// Helper functions
const toTitle = (str: string) => {
  return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const selectAllAssign = () => { selectedAssign.value = availableToAssign.value.map(p => Number(p.id)) }
const clearAssign = () => { selectedAssign.value = [] }
const selectAllRevoke = () => { selectedRevoke.value = availableToRevoke.value.map(p => Number(p.id)) }
const clearRevoke = () => { selectedRevoke.value = [] }

// Watch for dialog open/close
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    selectedAssign.value = []
    selectedRevoke.value = []
    activeTab.value = props.mode === 'revoke' ? 'revoke' : 'assign'
  }
})

// Close dialog
const closeDialog = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <VDialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="800" persistent>
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <VIcon icon="ri-shield-user-line" class="me-2" />
          <span>{{ t('system.users.permissions.title') }}</span>
        </div>
        <VBtn icon variant="text" size="small" @click="closeDialog">
          <VIcon icon="ri-close-line" />
        </VBtn>
      </VCardTitle>

      <VCardText>
        <div v-if="user" class="mb-4">
          <div class="d-flex align-center mb-2">
            <VAvatar size="32" color="primary" variant="tonal" class="me-3">
              <span class="text-sm">{{ `${user.prenom?.[0] || ''}${user.nom[0]}`.toUpperCase() }}</span>
            </VAvatar>
            <div>
              <h6 class="text-h6">{{ `${user.prenom || ''} ${user.nom}`.trim() }}</h6>
              <span class="text-sm text-medium-emphasis">{{ user.email }}</span>
            </div>
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ t('system.users.permissions.userLabel') }} {{ user.role ? t(`system.roles.labels.${user.role.nom}`) :
              t('system.users.no_role') }}
          </div>
        </div>

        <!-- Tabs for both mode -->
        <VTabs v-if="mode === 'both'" v-model="activeTab" class="mb-4">
          <VTab value="assign">
            <VIcon icon="ri-shield-check-line" class="me-2" />
            {{ t('system.users.permissions.assignTab') }}
          </VTab>
          <VTab value="revoke">
            <VIcon icon="ri-shield-cross-line" class="me-2" />
            {{ t('system.users.permissions.revokeTab') }}
          </VTab>
        </VTabs>

        <!-- Assign permissions section -->
        <div v-if="mode === 'assign' || (mode === 'both' && activeTab === 'assign')">
          <div class="d-flex align-center justify-space-between mb-3">
            <h6 class="text-h6">{{ t('system.users.permissions.assignSection') }}</h6>
            <div class="d-flex gap-2">
              <VBtn size="small" variant="outlined" @click="selectAllAssign" :disabled="!availableToAssign.length">
                {{ t('system.users.permissions.selectAll') }}
              </VBtn>
              <VBtn size="small" variant="outlined" @click="clearAssign" :disabled="!selectedAssign.length">
                {{ t('system.users.permissions.clear') }}
              </VBtn>
            </div>
          </div>

          <!-- Loading skeleton for permissions -->
          <PermissionsSkeleton v-if="loading" :chips="8" />

          <VAutocomplete v-else v-model="selectedAssign"
            :items="availableToAssign.map(p => ({ title: toTitle(p.nom), value: p.id }))"
            :placeholder="t('system.users.permissions.searchPlaceholder')" multiple chips closable-chips clearable
            variant="outlined" :prepend-inner-icon="'ri-search-line'"
            :no-data-text="t('system.users.permissions.nothingToAssign')" />

          <div class="d-flex justify-end mt-3" v-if="mode === 'assign'">
            <VBtn color="primary" :disabled="!canAssign"
              @click="emit('assign', { userId: user!.id, permission_ids: selectedAssignIds })">
              <VIcon start icon="ri-shield-check-line" />
              {{ t('system.users.actions.assign') }}
            </VBtn>
          </div>
        </div>

        <!-- Revoke permissions section -->
        <div v-if="mode === 'revoke' || (mode === 'both' && activeTab === 'revoke')">
          <div class="d-flex align-center justify-space-between mb-3">
            <h6 class="text-h6">{{ t('system.users.permissions.revokeSection') }}</h6>
            <div class="d-flex gap-2">
              <VBtn size="small" variant="outlined" @click="selectAllRevoke" :disabled="!availableToRevoke.length">
                {{ t('system.users.permissions.selectAll') }}
              </VBtn>
              <VBtn size="small" variant="outlined" @click="clearRevoke" :disabled="!selectedRevoke.length">
                {{ t('system.users.permissions.clear') }}
              </VBtn>
            </div>
          </div>

          <!-- Loading skeleton for permissions -->
          <PermissionsSkeleton v-if="loading" :chips="6" />

          <VAutocomplete v-else v-model="selectedRevoke"
            :items="availableToRevoke.map(p => ({ title: toTitle(p.nom), value: p.id }))"
            :placeholder="t('system.users.permissions.searchPlaceholder')" multiple chips closable-chips clearable
            variant="outlined" :prepend-inner-icon="'ri-search-line'"
            :no-data-text="t('system.users.permissions.nothingToRevoke')" />

          <div class="d-flex justify-end mt-3" v-if="mode === 'revoke'">
            <VBtn color="warning" :disabled="!canRevoke"
              @click="emit('revoke', { userId: user!.id, permission_ids: selectedRevokeIds })">
              <VIcon start icon="ri-shield-cross-line" />
              {{ t('system.users.actions.revoke') }}
            </VBtn>
          </div>
        </div>

        <!-- Both mode actions -->
        <div v-if="mode === 'both'" class="d-flex justify-end gap-3 mt-4">
          <VBtn v-if="activeTab === 'assign'" color="primary" :disabled="!canAssign"
            @click="emit('assign', { userId: user!.id, permission_ids: selectedAssignIds })">
            <VIcon start icon="ri-shield-check-line" />
            {{ t('system.users.actions.assign') }}
          </VBtn>

          <VBtn v-if="activeTab === 'revoke'" color="warning" :disabled="!canRevoke"
            @click="emit('revoke', { userId: user!.id, permission_ids: selectedRevokeIds })">
            <VIcon start icon="ri-shield-cross-line" />
            {{ t('system.users.actions.revoke') }}
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>
