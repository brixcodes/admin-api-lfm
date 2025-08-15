<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useUserProfile } from '@/composables/useUserProfile'
import { useGlobalNotifications } from '@/composables/useNotifications'
import { GenotypesApi } from '@/utils/services'
import type { GenotypeIndividuel } from '@/utils/types/models'

const { t } = useI18n()
const { user } = useUserProfile()
const { success: notifySuccess, error: notifyError } = useGlobalNotifications()

// State
const genotypes = ref<GenotypeIndividuel[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const filters = ref<{ types: string[]; sexes: string[] }>({ types: [], sexes: [] })

// Dialogs & forms
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const showConfirmDialog = ref(false)
const confirmAction = ref<'create' | 'edit' | 'delete'>('create')
const confirming = ref(false)
const selectedGenotype = ref<GenotypeIndividuel | null>(null)

// Details dialog state
const showDetailsDialog = ref(false)
const detailsLoading = ref(false)
const detailsError = ref<string | null>(null)
const detailsData = ref<GenotypeIndividuel | null>(null)

const createFormRef = ref()
const editFormRef = ref()
const createForm = ref({
  type: 'detenu' as 'detenu' | 'proche',
  nom: '', prenom: '', age: undefined as number | undefined, sexe: undefined as any,
  motif_detention: '', date_debut_detention: '', duree_detention: '', pays_detention: '', maison_detention: '',
  profession: '', activite_avant_detention: ''
})
const editForm = ref({
  id: 0,
  type: 'detenu' as 'detenu' | 'proche',
  nom: '', prenom: '', age: undefined as number | undefined, sexe: undefined as any,
  motif_detention: '', date_debut_detention: '', duree_detention: '', pays_detention: '', maison_detention: '',
  profession: '', activite_avant_detention: ''
})

// Validation rules
const rules = {
  required: (v: string | number | undefined | null) => !!(v !== undefined && v !== null && String(v).trim()) || t('validation.required'),
  max: (max: number) => (v: string) => !v || String(v).length <= max || t('validation.maxLength', { max }),
  integer: (v: number | undefined) => v === undefined || v === null || Number.isInteger(Number(v)) || t('validation.integer'),
  between15And99: (v: number | undefined) => v === undefined || v === null || (Number.isFinite(Number(v)) && Number(v) >= 15 && Number(v) <= 99) || t('validation.between', { min: 15, max: 99 }),
}

// Fetch
const fetchGenotypes = async () => {
  if (!user.value?.id) return
  isLoading.value = true
  error.value = null
  try {
    const list = await GenotypesApi.list({ skip: 0, limit: 200, utilisateur_id: user.value.id } as any)
    // Filtrer côté client si backend n'applique pas le filtre
    genotypes.value = (list as GenotypeIndividuel[]).filter(g => (g as any).utilisateur_id === user.value!.id)
  } catch (e: any) {
    error.value = e?.message || 'Erreur chargement'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchGenotypes)

// Computed filtered list
const filteredGenotypes = computed(() => {
  let items = genotypes.value
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    items = items.filter(g =>
      (g.nom || '').toLowerCase().includes(q) ||
      (g.prenom || '').toLowerCase().includes(q) ||
      (g.pays_detention || '').toLowerCase().includes(q) ||
      (g.maison_detention || '').toLowerCase().includes(q)
    )
  }
  if (filters.value.types.length) {
    items = items.filter(g => filters.value.types.includes(String(g.type)))
  }
  if (filters.value.sexes.length) {
    items = items.filter(g => g.sexe && filters.value.sexes.includes(String(g.sexe)))
  }
  return items
})

// Stats
const total = computed(() => genotypes.value.length)
const detainees = computed(() => genotypes.value.filter(g => String(g.type) === 'detenu').length)
const relatives = computed(() => genotypes.value.filter(g => String(g.type) === 'proche').length)
const withDetentionInfo = computed(() => genotypes.value.filter(g => g.pays_detention || g.maison_detention).length)

// Handlers
const openCreate = () => {
  createForm.value = { type: 'detenu', nom: '', prenom: '', age: undefined, sexe: undefined, motif_detention: '', date_debut_detention: '', duree_detention: '', pays_detention: '', maison_detention: '', profession: '', activite_avant_detention: '' }
  showCreateDialog.value = true
}
const openEdit = (g: GenotypeIndividuel) => {
  selectedGenotype.value = g
  editForm.value = { id: g.id, type: String(g.type) as any, nom: g.nom, prenom: g.prenom || '', age: (g.age as any) || undefined, sexe: (g.sexe as any) || undefined, motif_detention: g.motif_detention || '', date_debut_detention: g.date_debut_detention || '', duree_detention: g.duree_detention || '', pays_detention: g.pays_detention || '', maison_detention: g.maison_detention || '', profession: (g as any).profession || '', activite_avant_detention: (g as any).activite_avant_detention || '' }
  showEditDialog.value = true
}
const openDelete = (g: GenotypeIndividuel) => {
  selectedGenotype.value = g
  confirmAction.value = 'delete'
  showConfirmDialog.value = true
}

const requestCreate = async () => {
  const { valid } = await createFormRef.value.validate()
  if (!valid || !user.value?.id) return
  confirmAction.value = 'create'
  showConfirmDialog.value = true
}
const requestEdit = async () => {
  const { valid } = await editFormRef.value.validate()
  if (!valid) return
  confirmAction.value = 'edit'
  showConfirmDialog.value = true
}

const onConfirmYes = async () => {
  if (!user.value?.id) return
  confirming.value = true
  try {
    if (confirmAction.value === 'create') {
      const payload: any = { ...createForm.value, utilisateur_id: user.value.id }
      const created = await GenotypesApi.create(payload)
      genotypes.value.unshift(created as any)
      notifySuccess(t('genetique.individuel.notifications.create_success') as string)
      showCreateDialog.value = false
    } else if (confirmAction.value === 'edit' && selectedGenotype.value) {
      const id = selectedGenotype.value.id
      const { id: _omit, ...data } = editForm.value as any
      await GenotypesApi.update(id, data)
      await fetchGenotypes()
      notifySuccess(t('genetique.individuel.notifications.update_success') as string)
      showEditDialog.value = false
    } else if (confirmAction.value === 'delete' && selectedGenotype.value) {
      await GenotypesApi.remove(selectedGenotype.value.id)
      genotypes.value = genotypes.value.filter(g => g.id !== selectedGenotype.value!.id)
      notifySuccess(t('common.success') as string)
    }
  } catch (e: any) {
    notifyError(t('genetique.individuel.notifications.action_error') as string, e?.message)
  } finally {
    confirming.value = false
    showConfirmDialog.value = false
  }
}

// Open details dialog and fetch full details
const openDetails = async (g: GenotypeIndividuel) => {
  showDetailsDialog.value = true
  detailsLoading.value = true
  detailsError.value = null
  detailsData.value = null
  try {
    const full = await GenotypesApi.get(g.id)
    detailsData.value = full as any
  } catch (e: any) {
    detailsError.value = e?.message || (t('common.error') as string)
  } finally {
    detailsLoading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Stats -->
    <VRow class="mb-1">
      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex align-center">
            <VAvatar variant="tonal" color="primary" rounded size="42" class="me-3">
              <VIcon icon="ri-database-2-line" size="24" />
            </VAvatar>
            <div class="d-flex flex-column">
              <h6 class="text-h6 mb-1">
                <VSkeletonLoader v-if="isLoading" type="text" width="60" />
                <span v-else>{{ total }}</span>
              </h6>
              <VSkeletonLoader v-if="isLoading" type="text" width="120" />
              <span v-else class="text-sm text-medium-emphasis">{{ $t('genetique.individuel.stats.total') }}</span>
              <VSkeletonLoader v-if="isLoading" type="text" width="100" />
              <span v-else class="text-xs text-disabled">{{ $t('system.users.stats.last_week') }}</span>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex align-center">
            <VAvatar variant="tonal" color="success" rounded size="42" class="me-3">
              <VIcon icon="ri-handcuffs-line" size="24" />
            </VAvatar>
            <div class="d-flex flex-column">
              <h6 class="text-h6 mb-1">
                <VSkeletonLoader v-if="isLoading" type="text" width="60" />
                <span v-else>{{ detainees }}</span>
              </h6>
              <VSkeletonLoader v-if="isLoading" type="text" width="120" />
              <span v-else class="text-sm text-medium-emphasis">{{ $t('genetique.individuel.stats.detainees') }}</span>
              <VSkeletonLoader v-if="isLoading" type="text" width="100" />
              <span v-else class="text-xs text-disabled">{{ $t('system.users.stats.last_week') }}</span>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex align-center">
            <VAvatar variant="tonal" color="info" rounded size="42" class="me-3">
              <VIcon icon="ri-team-line" size="24" />
            </VAvatar>
            <div class="d-flex flex-column">
              <h6 class="text-h6 mb-1">
                <VSkeletonLoader v-if="isLoading" type="text" width="60" />
                <span v-else>{{ relatives }}</span>
              </h6>
              <VSkeletonLoader v-if="isLoading" type="text" width="120" />
              <span v-else class="text-sm text-medium-emphasis">{{ $t('genetique.individuel.stats.relatives') }}</span>
              <VSkeletonLoader v-if="isLoading" type="text" width="100" />
              <span v-else class="text-xs text-disabled">{{ $t('system.users.stats.last_week') }}</span>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" lg="3">
        <VCard>
          <VCardText class="d-flex align-center">
            <VAvatar variant="tonal" color="warning" rounded size="42" class="me-3">
              <VIcon icon="ri-map-pin-2-line" size="24" />
            </VAvatar>
            <div class="d-flex flex-column">
              <h6 class="text-h6 mb-1">
                <VSkeletonLoader v-if="isLoading" type="text" width="60" />
                <span v-else>{{ withDetentionInfo }}</span>
              </h6>
              <VSkeletonLoader v-if="isLoading" type="text" width="120" />
              <span v-else class="text-sm text-medium-emphasis">{{ $t('genetique.individuel.stats.with_detention_info')
              }}</span>
              <VSkeletonLoader v-if="isLoading" type="text" width="100" />
              <span v-else class="text-xs text-disabled">{{ $t('system.users.stats.last_week') }}</span>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Toolbar -->
    <VCard class="pa-3 mb-2">
      <div class="d-flex gap-3 flex-wrap">
        <VTextField v-model="searchQuery" :placeholder="$t('genetique.individuel.search')"
          prepend-inner-icon="ri-search-line" variant="outlined" density="compact" style="min-inline-size: 300px;"
          clearable />

        <VBtn color="primary" variant="outlined" @click="fetchGenotypes" :loading="isLoading"
          prepend-icon="ri-refresh-line">
          {{ $t('common.refresh') }}
        </VBtn>

        <VBtn color="primary" variant="flat" @click="openCreate" prepend-icon="ri-add-line">
          {{ $t('genetique.individuel.actions.add') }}
        </VBtn>
      </div>
    </VCard>

    <!-- Filters -->
    <VCard class="mb-2">
      <VCardText class="d-flex gap-3 flex-wrap">
        <VSelect v-model="filters.types" :items="[
          { title: $t('genetique.individuel.types.detenu'), value: 'detenu' },
          { title: $t('genetique.individuel.types.proche'), value: 'proche' },
        ]" multiple chips clearable :label="$t('genetique.individuel.filters.type')"
          prepend-inner-icon="ri-filter-2-line" />

        <VSelect v-model="filters.sexes" :items="[
          { title: $t('system.users.gender.homme'), value: 'homme' },
          { title: $t('system.users.gender.femme'), value: 'femme' },
          { title: $t('system.users.gender.autre'), value: 'autre' },
        ]" multiple chips clearable :label="$t('genetique.individuel.filters.gender')"
          prepend-inner-icon="ri-filter-3-line" />
      </VCardText>
    </VCard>

    <!-- Table -->
    <VCard>
      <VCardText>
        <template v-if="isLoading">
          <VSkeletonLoader type="table" class="mb-4" />
        </template>
        <template v-else>
          <VDataTable :headers="[
            { title: $t('genetique.individuel.table.full_name'), key: 'fullName', sortable: true },
            { title: $t('genetique.individuel.table.type'), key: 'type', sortable: true },
            { title: $t('genetique.individuel.table.gender'), key: 'sexe', sortable: true },
            { title: $t('genetique.individuel.table.age'), key: 'age', sortable: true },
            { title: $t('genetique.individuel.table.country'), key: 'pays_detention', sortable: true },
            { title: $t('genetique.individuel.table.facility'), key: 'maison_detention', sortable: true },
            { title: $t('genetique.individuel.table.start_date'), key: 'date_debut_detention', sortable: true },
            { title: $t('genetique.individuel.table.actions'), key: 'actions', sortable: false },
          ]" :items="filteredGenotypes" :items-per-page="10" class="text-no-wrap"
            :no-data-text="$t('system.users.table.no_data')">
            <template #item.fullName="{ item }">
              <div class="d-flex align-center">
                <VAvatar size="38" color="primary" variant="tonal" class="me-3">
                  <span class="text-sm font-weight-medium">{{ ((item.prenom || '') + ' ' +
                    item.nom).trim().slice(0, 2).toUpperCase() }}</span>
                </VAvatar>
                <div class="d-flex flex-column">
                  <h6 class="text-h6 font-weight-medium">{{ ((item.prenom || '') + ' ' + item.nom).trim() }}</h6>
                  <span class="text-sm text-medium-emphasis">{{ item.motif_detention }}</span>
                </div>
              </div>
            </template>
            <template #item.type="{ item }">
              <VChip size="small" variant="tonal" :color="String(item.type) === 'detenu' ? 'error' : 'info'">
                {{ $t(`genetique.individuel.types.${String(item.type)}`) }}
              </VChip>
            </template>
            <template #item.sexe="{ item }">
              <VChip size="small" variant="outlined" :color="item.sexe === 'homme' ? 'blue' : 'pink'">
                <VIcon start :icon="item.sexe === 'homme' ? 'ri-men-line' : 'ri-women-line'" />
                {{ $t(`system.users.gender.${item.sexe || 'autre'}`) }}
              </VChip>
            </template>
            <template #item.actions="{ item }">
              <div class="d-flex gap-1">
                <VTooltip>
                  <template #activator="{ props: tooltipProps }">
                    <VBtn v-bind="tooltipProps" size="small" variant="tonal" color="info" icon
                      @click="openDetails(item)">
                      <VIcon icon="ri-eye-line" />
                    </VBtn>
                  </template>
                  {{ $t('system.users.actions.view') }}
                </VTooltip>
                <VTooltip>
                  <template #activator="{ props: tooltipProps }">
                    <VBtn v-bind="tooltipProps" size="small" variant="tonal" color="primary" icon
                      @click="openEdit(item)">
                      <VIcon icon="ri-edit-line" />
                    </VBtn>
                  </template>
                  {{ $t('system.users.actions.edit') }}
                </VTooltip>
                <VTooltip>
                  <template #activator="{ props: tooltipProps }">
                    <VBtn v-bind="tooltipProps" size="small" variant="tonal" color="error" icon
                      @click="openDelete(item)">
                      <VIcon icon="ri-delete-bin-line" />
                    </VBtn>
                  </template>
                  {{ $t('system.users.actions.delete') }}
                </VTooltip>
              </div>
            </template>
          </VDataTable>
        </template>
      </VCardText>
    </VCard>

    <!-- Create Dialog -->
    <VDialog v-model="showCreateDialog" max-width="720" persistent>
      <VCard>
        <VCardTitle class="text-h6">{{ $t('genetique.individuel.actions.add') }}</VCardTitle>
        <VCardText>
          <VForm ref="createFormRef">
            <VRow>
              <VCol cols="12" md="6">
                <VSelect v-model="createForm.type" :label="$t('genetique.individuel.form.type')" :items="[
                  { title: $t('genetique.individuel.types.detenu'), value: 'detenu' },
                  { title: $t('genetique.individuel.types.proche'), value: 'proche' },
                ]" prepend-inner-icon="ri-user-heart-line" :rules="[rules.required]" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="createForm.nom" :label="$t('genetique.individuel.form.last_name')"
                  :placeholder="$t('genetique.individuel.placeholders.last_name')" prepend-inner-icon="ri-user-3-line"
                  :rules="[rules.required, rules.max(255)]" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="createForm.prenom" :label="$t('genetique.individuel.form.first_name')"
                  :placeholder="$t('genetique.individuel.placeholders.first_name')" prepend-inner-icon="ri-user-line"
                  :rules="[rules.max(255)]" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model.number="createForm.age" type="number" :label="$t('genetique.individuel.form.age')"
                  prepend-inner-icon="ri-hourglass-line" :rules="[rules.integer, rules.between15And99]" min="15"
                  max="99" step="1" />
              </VCol>
              <VCol cols="12" md="6">
                <VSelect v-model="createForm.sexe" :label="$t('system.users.details.gender')" :items="[
                  { value: 'homme', title: $t('system.users.gender.homme') as string },
                  { value: 'femme', title: $t('system.users.gender.femme') as string },
                  { value: 'autre', title: $t('system.users.gender.autre') as string }
                ]" prepend-inner-icon="ri-genderless-line" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="createForm.motif_detention"
                  :label="$t('genetique.individuel.form.motif_detention')" prepend-inner-icon="ri-article-line"
                  :rules="[rules.max(255)]" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="createForm.date_debut_detention" type="date"
                  :label="$t('genetique.individuel.form.date_debut_detention')" prepend-inner-icon="ri-calendar-line" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="createForm.duree_detention"
                  :label="$t('genetique.individuel.form.duree_detention')" prepend-inner-icon="ri-timer-line"
                  :rules="[rules.max(50)]" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="createForm.pays_detention" :label="$t('genetique.individuel.form.pays_detention')"
                  prepend-inner-icon="ri-earth-line" :rules="[rules.max(255)]" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="createForm.maison_detention"
                  :label="$t('genetique.individuel.form.maison_detention')" prepend-inner-icon="ri-building-2-line"
                  :rules="[rules.max(255)]" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="createForm.profession" :label="$t('genetique.individuel.form.profession')"
                  prepend-inner-icon="ri-briefcase-2-line" :rules="[rules.max(255)]" />
              </VCol>
              <VCol cols="12">
                <VTextField v-model="createForm.activite_avant_detention"
                  :label="$t('genetique.individuel.form.activite_avant_detention')" prepend-inner-icon="ri-run-line" />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="outlined" color="secondary" @click="showCreateDialog = false">{{ $t('common.cancel') }}</VBtn>
          <VBtn color="primary" @click="requestCreate">{{ $t('common.save') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Details Dialog -->
    <VDialog v-model="showDetailsDialog" max-width="900" persistent>
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <VAvatar size="40" color="primary" variant="tonal" class="me-3">
              <VIcon icon="ri-dna-line" />
            </VAvatar>
            <div>
              <div class="text-h5">{{ $t('genetique.individuel.details.title') }}</div>
              <div class="text-body-2 text-medium-emphasis">
                {{ ((detailsData?.prenom || '') + ' ' + (detailsData?.nom || '')).trim() }}
              </div>
            </div>
          </div>
          <VBtn icon variant="text" @click="showDetailsDialog = false">
            <VIcon icon="ri-close-line" />
          </VBtn>
        </VCardTitle>

        <VCardText class="pa-6">
          <template v-if="detailsLoading">
            <VSkeletonLoader type="paragraph, paragraph" />
          </template>
          <template v-else>
            <VAlert v-if="detailsError" type="error" variant="tonal" class="mb-4">{{ detailsError }}</VAlert>

            <div class="text-subtitle-1 mb-2">{{ $t('genetique.individuel.details.sections.general') }}</div>
            <VRow class="mb-4">
              <VCol cols="12" md="4"><strong>{{ $t('genetique.individuel.form.type') }}:</strong> {{
                $t(`genetique.individuel.types.${String(detailsData?.type || 'detenu')}`) }}</VCol>
              <VCol cols="12" md="4"><strong>{{ $t('genetique.individuel.form.first_name') }}:</strong> {{
                detailsData?.prenom || $t('common.not_specified') }}</VCol>
              <VCol cols="12" md="4"><strong>{{ $t('genetique.individuel.form.last_name') }}:</strong> {{
                detailsData?.nom || $t('common.not_specified') }}</VCol>
              <VCol cols="12" md="4"><strong>{{ $t('genetique.individuel.form.age') }}:</strong> {{ detailsData?.age ??
                $t('common.not_specified') }}</VCol>
              <VCol cols="12" md="4"><strong>{{ $t('system.users.details.gender') }}:</strong> {{ detailsData?.sexe ?
                $t(`system.users.gender.${detailsData.sexe}`) : $t('common.not_specified') }}</VCol>
              <VCol cols="12" md="4"><strong>{{ $t('genetique.individuel.form.profession') }}:</strong> {{ (detailsData
                && (detailsData as any).profession) || $t('common.not_specified') }}</VCol>
            </VRow>

            <div class="text-subtitle-1 mb-2">{{ $t('genetique.individuel.details.sections.detention') }}</div>
            <VRow class="mb-4">
              <VCol cols="12" md="6"><strong>{{ $t('genetique.individuel.form.activite_avant_detention') }}:</strong> {{
                (detailsData && (detailsData as any).activite_avant_detention) || $t('common.not_specified') }}</VCol>
              <VCol cols="12" md="6"><strong>{{ $t('genetique.individuel.form.motif_detention') }}:</strong> {{
                detailsData?.motif_detention || $t('common.not_specified') }}</VCol>
              <VCol cols="12" md="4"><strong>{{ $t('genetique.individuel.form.pays_detention') }}:</strong> {{
                detailsData?.pays_detention || $t('common.not_specified') }}</VCol>
              <VCol cols="12" md="4"><strong>{{ $t('genetique.individuel.form.maison_detention') }}:</strong> {{
                detailsData?.maison_detention || $t('common.not_specified') }}</VCol>
              <VCol cols="12" md="4"><strong>{{ $t('genetique.individuel.form.date_debut_detention') }}:</strong> {{
                detailsData?.date_debut_detention || $t('common.not_specified') }}</VCol>
              <VCol cols="12" md="4"><strong>{{ $t('genetique.individuel.form.duree_detention') }}:</strong> {{
                detailsData?.duree_detention || $t('common.not_specified') }}</VCol>
            </VRow>

            <div class="text-subtitle-1 mb-2">{{ $t('genetique.individuel.details.sections.ascendance') }}</div>
            <div class="mb-4" v-if="detailsData?.ascendance">{{ JSON.stringify(detailsData.ascendance) }}</div>
            <div class="mb-4" v-else>{{ $t('common.no_data') }}</div>

            <div class="text-subtitle-1 mb-2">{{ $t('genetique.individuel.details.sections.health') }}</div>
            <div class="mb-4" v-if="detailsData?.sante">{{ JSON.stringify(detailsData.sante) }}</div>
            <div class="mb-4" v-else>{{ $t('common.no_data') }}</div>

            <div class="text-subtitle-1 mb-2">{{ $t('genetique.individuel.details.sections.education') }}</div>
            <div class="mb-4" v-if="detailsData?.education">{{ JSON.stringify(detailsData.education) }}</div>
            <div class="mb-4" v-else>{{ $t('common.no_data') }}</div>

            <div class="text-subtitle-1 mb-2">{{ $t('genetique.individuel.details.sections.plans') }}</div>
            <div class="mb-2" v-if="detailsData?.plans_intervention?.length">{{ detailsData.plans_intervention.length }}
            </div>
            <div v-else>{{ $t('common.no_data') }}</div>
          </template>
        </VCardText>
        <VCardActions class="pa-4 justify-end">
          <VBtn color="primary" variant="flat" @click="showDetailsDialog = false">{{ $t('common.close') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Edit Dialog -->
    <VDialog v-model="showEditDialog" max-width="720" persistent>
      <VCard>
        <VCardTitle class="text-h6">{{ $t('system.users.actions.edit') }}</VCardTitle>
        <VCardText>
          <VForm ref="editFormRef">
            <VRow>
              <VCol cols="12" md="6">
                <VSelect v-model="editForm.type" :label="$t('genetique.individuel.form.type')" :items="[
                  { title: $t('genetique.individuel.types.detenu'), value: 'detenu' },
                  { title: $t('genetique.individuel.types.proche'), value: 'proche' },
                ]" prepend-inner-icon="ri-user-heart-line" :rules="[rules.required]" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="editForm.nom" :label="$t('genetique.individuel.form.last_name')"
                  :placeholder="$t('genetique.individuel.placeholders.last_name')" prepend-inner-icon="ri-user-3-line"
                  :rules="[rules.required, rules.max(255)]" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="editForm.prenom" :label="$t('genetique.individuel.form.first_name')"
                  :placeholder="$t('genetique.individuel.placeholders.first_name')" prepend-inner-icon="ri-user-line"
                  :rules="[rules.max(255)]" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model.number="editForm.age" type="number" :label="$t('genetique.individuel.form.age')"
                  prepend-inner-icon="ri-hourglass-line" :rules="[rules.integer, rules.between15And99]" min="15"
                  max="99" step="1" />
              </VCol>
              <VCol cols="12" md="6">
                <VSelect v-model="editForm.sexe" :label="$t('system.users.details.gender')" :items="[
                  { value: 'homme', title: $t('system.users.gender.homme') as string },
                  { value: 'femme', title: $t('system.users.gender.femme') as string },
                  { value: 'autre', title: $t('system.users.gender.autre') as string }
                ]" prepend-inner-icon="ri-genderless-line" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="editForm.motif_detention" :label="$t('genetique.individuel.form.motif_detention')"
                  prepend-inner-icon="ri-article-line" :rules="[rules.max(255)]" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="editForm.date_debut_detention" type="date"
                  :label="$t('genetique.individuel.form.date_debut_detention')" prepend-inner-icon="ri-calendar-line" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="editForm.duree_detention" :label="$t('genetique.individuel.form.duree_detention')"
                  prepend-inner-icon="ri-timer-line" :rules="[rules.max(50)]" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="editForm.pays_detention" :label="$t('genetique.individuel.form.pays_detention')"
                  prepend-inner-icon="ri-earth-line" :rules="[rules.max(255)]" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="editForm.maison_detention"
                  :label="$t('genetique.individuel.form.maison_detention')" prepend-inner-icon="ri-building-2-line"
                  :rules="[rules.max(255)]" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="editForm.profession" :label="$t('genetique.individuel.form.profession')"
                  prepend-inner-icon="ri-briefcase-2-line" :rules="[rules.max(255)]" />
              </VCol>
              <VCol cols="12">
                <VTextField v-model="editForm.activite_avant_detention"
                  :label="$t('genetique.individuel.form.activite_avant_detention')" prepend-inner-icon="ri-run-line" />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="outlined" color="secondary" @click="showEditDialog = false">{{ $t('common.cancel') }}</VBtn>
          <VBtn color="primary" @click="requestEdit">{{ $t('common.save') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Confirm Dialog for create/edit/delete -->
    <VDialog v-model="showConfirmDialog" max-width="420" persistent>
      <VCard class="pa-4 rounded-lg">
        <VCardTitle class="text-h6">{{ $t('genetique.individuel.confirm.title') }}</VCardTitle>
        <VCardText>
          {{ $t('genetique.individuel.confirm.message') }}
        </VCardText>
        <VCardActions class="justify-end">
          <VBtn variant="outlined" color="secondary" @click="showConfirmDialog = false">{{ $t('common.cancel') }}</VBtn>
          <VBtn color="primary" :loading="confirming" @click="onConfirmYes">{{ $t('common.confirm') }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
