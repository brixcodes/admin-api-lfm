<script setup lang="ts">
import { PermissionsApi } from '@/utils/services'
import type { RoleEnum } from '@/utils/types/enums'
import type { PermissionLight } from '@/utils/types/models'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// UI state
const search = ref('')
const page = ref(1)

const rowsPerPage = ref(10)
const loading = ref(false)
const items = ref<PermissionLight[]>([])


const fetchData = async () => {
  loading.value = true
  try {
    const perms = await PermissionsApi.list()
    items.value = perms as any // typed to PermissionLight by service now
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter(p => String(p.nom).toLowerCase().includes(q))
})

const headers = computed(() => [
  { title: (t('system.permissions.columns.name') || 'Name').toUpperCase(), key: 'name' },
  { title: (t('system.permissions.columns.assigned_to') || 'Assigned To').toUpperCase(), key: 'assigned_to' },
])

const tableItems = computed(() => filtered.value.map(p => ({ id: p.id, name: toTitle(p.nom), assigned_to: p.roles })))

const resolveRoleVariant = (name: RoleEnum) => {
  switch (name) {
    case 'admin': return { color: 'secondary', text: t('roles.labels.admin') as string }
    case 'coordonnateur': return { color: 'info', text: t('roles.labels.coordonnateur') as string }
    case 'formateur': return { color: 'error', text: t('roles.labels.formateur') as string }
    case 'referent': return { color: 'warning', text: t('roles.labels.referent') as string }
    case 'apprenant': return { color: 'success', text: t('roles.labels.apprenant') as string }
    default: return { color: 'secondary', text: String(name) }
  }
}
const toTitle = (key: string) => key.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')

const showError = ref(false)
const errorMsg = ref('')

</script>

<template>
  <div>
    <VAlert
      v-model="showError"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
    >{{ errorMsg }}</VAlert>

    <VCard>
      <VCol
          cols="12"
          offset-md="8"
          md="4"
        >
      <VTextField
          v-model="search"
          :placeholder="$t('system.permissions.search') || 'Search Permission'"
          prepend-inner-icon="ri-search-line"
          hide-details
          density="comfortable"
          class="flex-grow-1"
        />
        </VCol>

      <VDataTable
        :headers="headers"
        :items="tableItems"
        :items-per-page="rowsPerPage"
        class="text-no-wrap"
      >
        <template #item.name="{ item }">
          <span class="d-block font-weight-medium text-high-emphasis text-truncate">{{ item.name }}</span>
        </template>

        <template #item.assigned_to="{ item }">
          <div class="d-flex flex-wrap gap-2">
            <VChip
              v-for="r in item.assigned_to"
              :key="r.id"
              :color="resolveRoleVariant(r.nom as RoleEnum).color"
              label
              size="small"
              variant="tonal"
            >{{ resolveRoleVariant(r.nom as RoleEnum).text }}</VChip>
            <span v-if="!item.assigned_to.length" class="text-disabled">—</span>
          </div>
        </template>
      </VDataTable>
    </VCard>

  </div>
</template>
