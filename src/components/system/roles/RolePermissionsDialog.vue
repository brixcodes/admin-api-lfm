<script setup lang="ts">
import type { PermissionLight, Role } from '@/utils/types/models';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  modelValue: boolean
  role: Role | null
  allPermissions: PermissionLight[]
  loading?: boolean
  mode?: 'assign' | 'revoke' | 'both'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'assign', payload: { roleId: number; permission_ids: number[] }): void
  (e: 'revoke', payload: { roleId: number; permission_ids: number[] }): void
}>()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const selectedAssign = ref<number[]>([])
const selectedRevoke = ref<number[]>([])

// Onglet actif quand mode = 'both'
const tab = ref<'assign' | 'revoke'>(props.mode === 'revoke' ? 'revoke' : 'assign')
watch(() => props.mode, m => { tab.value = m === 'revoke' ? 'revoke' : 'assign' })

watch(() => props.role, () => { selectedAssign.value = []; selectedRevoke.value = [] })
watch(() => props.mode, () => { selectedAssign.value = []; selectedRevoke.value = [] })

const toTitle = (key: string) => key.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')

const assignedNames = computed(() => new Set((props.role?.permissions || [] as string[])))
const availableToAssign = computed(() => props.allPermissions.filter(p => !assignedNames.value.has(p.nom)))
const availableToRevoke = computed(() => props.allPermissions.filter(p =>  assignedNames.value.has(p.nom)))

const canAssign = computed(() => !!props.role && selectedAssign.value.length > 0)
const canRevoke = computed(() => !!props.role && selectedRevoke.value.length > 0)

const assignCount = computed(() => availableToAssign.value.length)
const revokeCount = computed(() => availableToRevoke.value.length)

const selectAllAssign = () => { selectedAssign.value = availableToAssign.value.map(p => p.id) }
const clearAssign = () => { selectedAssign.value = [] }
const selectAllRevoke = () => { selectedRevoke.value = availableToRevoke.value.map(p => p.id) }
const clearRevoke = () => { selectedRevoke.value = [] }
</script>

<template>
  <VDialog v-model="open" max-width="860" scrollable>
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-2">
          <VIcon icon="ri-key-2-line" />
          <div>
            <div class="text-subtitle-1">{{ $t('system.roles.permissions.title') }}</div>
            <div class="text-caption text-medium-emphasis">{{ $t('system.roles.permissions.roleLabel') }} <strong>{{ props.role?.nom }}</strong></div>
          </div>
        </div>
        <VBtn icon variant="text" @click="open = false"><VIcon icon="ri-close-line" /></VBtn>
      </VCardTitle>

      <VProgressLinear v-if="loading" indeterminate color="primary" />

      <VCardText>
        <!-- Tabs si les deux modes sont autorisés -->
        <div v-if="props.mode === 'both'">
          <VTabs v-model="tab" class="v-tabs-pill">
            <VTab value="assign"><VIcon size="18" start icon="ri-add-line" />Affecter ({{ assignCount }})</VTab>
            <VTab value="revoke"><VIcon size="18" start icon="ri-close-line" />Révoquer ({{ revokeCount }})</VTab>
          </VTabs>

          <VWindow v-model="tab" class="mt-4">
            <!-- Panel Affecter -->
            <VWindowItem value="assign">
              <VCard variant="tonal" class="pa-4">
                <div class="text-subtitle-2 mb-3">{{ $t('system.roles.permissions.assignSection') }}</div>
                <VAutocomplete
                  v-model="selectedAssign"
                  :items="availableToAssign.map(p => ({ title: toTitle(p.nom), value: p.id }))"
                  multiple
                  chips
                  closable-chips
                  clearable
                  hide-details
                  prepend-inner-icon="ri-search-line"
                  density="comfortable"
                  variant="outlined"
                  :placeholder="$t('system.roles.permissions.searchPlaceholder')"
                  :disabled="assignCount === 0"
                />
                <div class="d-flex align-center justify-space-between mt-2">
                  <div class="text-caption text-medium-emphasis">{{ assignCount }} permission(s) disponible(s)</div>
                  <div class="d-flex gap-2">
                    <VBtn size="small" variant="text" @click="selectAllAssign" :disabled="assignCount === 0">{{ $t('system.roles.permissions.selectAll') }}</VBtn>
                    <VBtn size="small" variant="text" @click="clearAssign" :disabled="selectedAssign.length===0">{{ $t('system.roles.permissions.clear') }}</VBtn>
                    <VBtn size="small" color="primary" :disabled="!canAssign" @click="emit('assign', { roleId: props.role!.id, permission_ids: selectedAssign })">
                      <VIcon icon="ri-add-line" class="me-1" /> {{ $t('system.roles.actions.assign') }}
                    </VBtn>
                  </div>
                </div>
                <VAlert v-if="assignCount === 0" type="info" variant="tonal" class="mt-3">{{ $t('system.roles.permissions.nothingToAssign') }}</VAlert>
              </VCard>
            </VWindowItem>

            <!-- Panel Révoquer -->
            <VWindowItem value="revoke">
              <VCard variant="tonal" class="pa-4">
                <div class="text-subtitle-2 mb-3">{{ $t('system.roles.permissions.revokeSection') }}</div>
                <VAutocomplete
                  v-model="selectedRevoke"
                  :items="availableToRevoke.map(p => ({ title: toTitle(p.nom), value: p.id }))"
                  multiple
                  chips
                  closable-chips
                  clearable
                  hide-details
                  prepend-inner-icon="ri-search-line"
                  density="comfortable"
                  variant="outlined"
                  :placeholder="$t('system.roles.permissions.searchPlaceholder')"
                  :disabled="revokeCount === 0"
                />
                <div class="d-flex align-center justify-space-between mt-2">
                  <div class="text-caption text-medium-emphasis">{{ revokeCount }} permission(s) associée(s)</div>
                  <div class="d-flex gap-2">
                    <VBtn size="small" variant="text" @click="selectAllRevoke" :disabled="revokeCount === 0">{{ $t('system.roles.permissions.selectAll') }}</VBtn>
                    <VBtn size="small" variant="text" @click="clearRevoke" :disabled="selectedRevoke.length===0">{{ $t('system.roles.permissions.clear') }}</VBtn>
                    <VBtn size="small" color="error" variant="tonal" :disabled="!canRevoke" @click="emit('revoke', { roleId: props.role!.id, permission_ids: selectedRevoke })">
                      <VIcon icon="ri-close-line" class="me-1" /> {{ $t('system.roles.actions.revoke') }}
                    </VBtn>
                  </div>
                </div>
                <VAlert v-if="revokeCount === 0" type="info" variant="tonal" class="mt-3">{{ $t('system.roles.permissions.nothingToRevoke') }}</VAlert>
              </VCard>
            </VWindowItem>
          </VWindow>
        </div>

        <!-- Modes simples -->
        <div v-else>
          <VRow>
            <VCol v-if="props.mode !== 'revoke'" cols="12">
              <VCard variant="tonal" class="pa-4">
                <div class="text-subtitle-2 mb-3">{{ $t('system.roles.permissions.assignSection') }}</div>
                <VAutocomplete
                  v-model="selectedAssign"
                  :items="availableToAssign.map(p => ({ title: toTitle(p.nom), value: p.id }))"
                  multiple chips closable-chips clearable hide-details
                  prepend-inner-icon="ri-search-line" density="comfortable" variant="outlined"
                  :placeholder="$t('system.roles.permissions.searchPlaceholder')" :disabled="assignCount === 0"
                />
                <div class="d-flex align-center justify-space-between mt-2">
                  <div class="text-caption text-medium-emphasis">{{ assignCount }} permission(s) disponible(s)</div>
                  <div class="d-flex gap-2">
                    <VBtn size="small" variant="text" @click="selectAllAssign" :disabled="assignCount === 0">{{ $t('system.roles.permissions.selectAll') }}</VBtn>
                    <VBtn size="small" variant="text" @click="clearAssign" :disabled="selectedAssign.length===0">{{ $t('system.roles.permissions.clear') }}</VBtn>
                    <VBtn size="small" color="primary" :disabled="!canAssign" @click="emit('assign', { roleId: props.role!.id, permission_ids: selectedAssign })">
                      <VIcon icon="ri-add-line" class="me-1" /> {{ $t('system.roles.actions.assign') }}
                    </VBtn>
                  </div>
                </div>
              </VCard>
            </VCol>

            <VCol v-if="props.mode !== 'assign'" cols="12">
              <VCard variant="tonal" class="pa-4">
                <div class="text-subtitle-2 mb-3">{{ $t('system.roles.permissions.revokeSection') }}</div>
                <VAutocomplete
                  v-model="selectedRevoke"
                  :items="availableToRevoke.map(p => ({ title: toTitle(p.nom), value: p.id }))"
                  multiple chips closable-chips clearable hide-details
                  prepend-inner-icon="ri-search-line" density="comfortable" variant="outlined"
                  :placeholder="$t('system.roles.permissions.searchPlaceholder')" :disabled="revokeCount === 0"
                />
                <div class="d-flex align-center justify-space-between mt-2">
                  <div class="text-caption text-medium-emphasis">{{ revokeCount }} permission(s) associée(s)</div>
                  <div class="d-flex gap-2">
                    <VBtn size="small" variant="text" @click="selectAllRevoke" :disabled="revokeCount === 0">{{ $t('system.roles.permissions.selectAll') }}</VBtn>
                    <VBtn size="small" variant="text" @click="clearRevoke" :disabled="selectedRevoke.length===0">{{ $t('system.roles.permissions.clear') }}</VBtn>
                    <VBtn size="small" color="error" variant="tonal" :disabled="!canRevoke" @click="emit('revoke', { roleId: props.role!.id, permission_ids: selectedRevoke })">
                      <VIcon icon="ri-close-line" class="me-1" /> {{ $t('system.roles.actions.revoke') }}
                    </VBtn>
                  </div>
                </div>
              </VCard>
            </VCol>
          </VRow>
        </div>
      </VCardText>

      <VCardActions class="px-6 pb-4">
        <VSpacer />
        <VBtn variant="text" @click="open = false">Fermer</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
