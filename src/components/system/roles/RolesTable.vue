<script setup lang="ts">
import type { RoleEnum } from '@/utils/types/enums';
import type { Role } from '@/utils/types/models';

defineProps<{
  items: Role[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'assign-perms', role: Role): void
  (e: 'revoke-perms', role: Role): void
}>()

const toTitle = (key: string) => key.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')

const resolveRoleVariant = (name: RoleEnum) => {
  switch (name) {
    case 'admin': return { color: 'secondary', text: 'Administrateur' }
    case 'coordonnateur': return { color: 'info', text: 'Coordonnateur' }
    case 'formateur': return { color: 'error', text: 'Formateur' }
    case 'referent': return { color: 'warning', text: 'Référent' }
    case 'apprenant': return { color: 'success', text: 'Apprenant' }
    default: return { color: 'secondary', text: String(name) }
  }
}

const headers = [
  { title: 'ROLE', key: 'role' },
  { title: 'PERMISSIONS', key: 'perms' },
  { title: 'ACTIONS', key: 'actions', sortable: false },
]
</script>

<template>
  <VDataTable :headers="headers" :items="items" :loading="loading" class="text-no-wrap">
    <!-- role column -->
    <template #item.role="{ item }">
      <div class="d-flex align-center gap-3">
        <VIcon icon="ri-shield-keyhole-line" color="secondary" />
        <VChip
          :color="resolveRoleVariant(item.nom as RoleEnum).color"
          variant="tonal"
          label
          size="small"
        >{{ resolveRoleVariant(item.nom as RoleEnum).text }}</VChip>
      </div>
    </template>

    <!-- permissions column -->
    <template #item.perms="{ item }">
      <div class="d-flex flex-wrap gap-2 align-center">
        <VChip
          v-for="p in (item.permissions || []).slice(0, 5)"
          :key="p.id"
          color="primary"
          label
          size="small"
          variant="tonal"
        >{{ toTitle(p.nom) }}</VChip>
        <span v-if="(item.permissions?.length || 0) > 5" class="text-disabled">+{{ (item.permissions!.length) - 5 }}</span>
        <span v-if="!(item.permissions?.length)" class="text-disabled">—</span>
      </div>
    </template>

    <!-- actions column -->
    <template #item.actions="{ item }">
      <div class="d-flex align-center gap-2">
        <VTooltip text="Affecter permissions">
          <template #activator="{ props }">
            <VBtn v-bind="props" size="small" variant="tonal" color="primary" icon @click="emit('assign-perms', item)">
              <VIcon icon="ri-add-line" />
            </VBtn>
          </template>
        </VTooltip>

        <VTooltip text="Révoquer permissions">
          <template #activator="{ props }">
            <VBtn v-bind="props" size="small" variant="tonal" color="error" icon @click="emit('revoke-perms', item)">
              <VIcon icon="ri-close-line" />
            </VBtn>
          </template>
        </VTooltip>
      </div>
    </template>
  </VDataTable>
</template>

