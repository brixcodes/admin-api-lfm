<script setup lang="ts">
import type { RoleEnum } from '@/utils/types/enums';
import type { Role } from '@/utils/types/models';
import { useI18n } from 'vue-i18n';

defineProps<{
  items: Role[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'assign-perms', role: Role): void
  (e: 'revoke-perms', role: Role): void
}>()

const { t } = useI18n()

const toTitle = (key: string) => key.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')

const resolveRoleVariant = (name: RoleEnum) => {
  const label = t(`roles.labels.${name}`)
  switch (name) {
    case 'admin': return { color: 'secondary', text: label }
    case 'coordonnateur': return { color: 'info', text: label }
    case 'formateur': return { color: 'error', text: label }
    case 'referent': return { color: 'warning', text: label }
    case 'apprenant': return { color: 'success', text: label }
    default: return { color: 'secondary', text: String(name) }
  }
}

const headers = computed(() => ([
  { title: t('system.roles.table.role'), key: 'role' },
  { title: t('system.roles.table.permissions'), key: 'perms' },
  { title: t('system.roles.table.actions'), key: 'actions', sortable: false },
]))
</script>

<template>
  <VCard>
    <VDataTable :headers="headers" :items="items" :loading="loading" class="text-no-wrap">
      <!-- role column -->
      <template #item.role="{ item }">
        <div class="d-flex align-center gap-3">
          <VIcon icon="ri-shield-keyhole-line" color="secondary" />
          <VChip :color="resolveRoleVariant(item.nom as RoleEnum).color" variant="tonal" label size="small">{{
            resolveRoleVariant(item.nom as RoleEnum).text }}</VChip>
        </div>
      </template>

      <!-- permissions column -->
      <template #item.perms="{ item }">
        <div class="d-flex flex-wrap gap-2 align-center">
          <VChip v-for="p in (item.permissions || []).slice(0, 5)" :key="p.id" color="secondary" label size="small"
            variant="tonal">{{ toTitle(p.nom) }}</VChip>
          <span v-if="(item.permissions?.length || 0) > 5" class="text-disabled">+{{ (item.permissions!.length) - 5
          }}</span>
          <span v-if="!(item.permissions?.length)" class="text-disabled">—</span>
        </div>
      </template>

      <!-- actions column -->
      <template #item.actions="{ item }">
        <div class="d-flex align-center gap-2">
          <VTooltip :text="t('system.roles.actions.assignTooltip')">
            <template #activator="{ props }">
              <VBtn v-bind="props" size="small" variant="tonal" color="info" icon @click="emit('assign-perms', item)">
                <VIcon icon="ri-add-line" />
              </VBtn>
            </template>
          </VTooltip>

          <VTooltip :text="t('system.roles.actions.revokeTooltip')">
            <template #activator="{ props }">
              <VBtn v-bind="props" size="small" variant="tonal" color="warning" icon
                @click="emit('revoke-perms', item)">
                <VIcon icon="ri-close-line" />
              </VBtn>
            </template>
          </VTooltip>
        </div>
      </template>
    </VDataTable>
  </VCard>

</template>
