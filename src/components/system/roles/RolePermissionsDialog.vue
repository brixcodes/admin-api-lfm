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

watch(() => props.role, r => {
  selectedAssign.value = []
  selectedRevoke.value = []
})

watch(() => props.mode, () => {
  // reset when mode changes
  selectedAssign.value = []
  selectedRevoke.value = []
})

const toTitle = (key: string) => key.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')

const assignedIds = computed(() => new Set((props.role?.permissions || []).map(p => p.id)))
const availableToAssign = computed(() => props.allPermissions.filter(p => !assignedIds.value.has(p.id)))
const availableToRevoke = computed(() => props.allPermissions.filter(p => assignedIds.value.has(p.id)))

const canAssign = computed(() => !!props.role && selectedAssign.value.length > 0)
const canRevoke = computed(() => !!props.role && selectedRevoke.value.length > 0)
</script>

<template>
  <VDialog v-model="open" max-width="720">
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <div>
          <VIcon icon="ri-key-2-line" class="me-2" />
          Gestion des permissions — <strong>{{ props.role?.nom }}</strong>
        </div>
        <VBtn icon variant="text" @click="open = false"><VIcon icon="ri-close-line" /></VBtn>
      </VCardTitle>

      <VCardText>
        <VRow>
          <VCol v-if="props.mode !== 'revoke'" cols="12" md="6">
            <div class="text-subtitle-2 mb-2">Affecter des permissions</div>
            <VSelect
              v-model="selectedAssign"
              :items="availableToAssign.map(p => ({ title: toTitle(p.nom), value: p.id }))"
              multiple
              chips
              closable-chips
              clearable
              hide-details
              :loading="loading"
              placeholder="Sélectionner des permissions à ajouter"
            />
            <VBtn class="mt-2" color="primary" :disabled="!canAssign" @click="emit('assign', { roleId: props.role!.id, permission_ids: selectedAssign })">
              <VIcon icon="ri-add-line" class="me-1" /> Affecter
            </VBtn>
          </VCol>

          <VCol v-if="props.mode !== 'assign'" cols="12" md="6">
            <div class="text-subtitle-2 mb-2">Révoquer des permissions</div>
            <VSelect
              v-model="selectedRevoke"
              :items="availableToRevoke.map(p => ({ title: toTitle(p.nom), value: p.id }))"
              multiple
              chips
              closable-chips
              clearable
              hide-details
              :loading="loading"
              placeholder="Sélectionner des permissions à retirer"
            />
            <VBtn class="mt-2" color="error" variant="tonal" :disabled="!canRevoke" @click="emit('revoke', { roleId: props.role!.id, permission_ids: selectedRevoke })">
              <VIcon icon="ri-close-line" class="me-1" /> Révoquer
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="open = false">Fermer</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

