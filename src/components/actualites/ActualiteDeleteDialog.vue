<template>
  <VDialog v-model="isOpen" max-width="500" persistent>
    <VCard>
      <VCardTitle class="text-h5 pa-6 pb-4">
        <div class="d-flex align-center">
          <VAvatar size="40" color="error" variant="tonal" class="me-3">
            <VIcon icon="ri-delete-bin-line" />
          </VAvatar>
          <div>
            <div class="text-h5">{{ t('actualites.modal.delete.title') }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ t('actualites.modal.delete.subtitle') }}</div>
          </div>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-6">
        <div class="text-body-1 mb-4">{{ t('actualites.modal.delete.confirm') }}</div>

        <!-- Actualité à supprimer -->
        <VCard v-if="actualite" variant="tonal" color="error" class="mb-4">
          <VCardText class="pa-4">
            <div class="d-flex align-center gap-3">
              <VAvatar size="48" color="error" variant="tonal">
                <VIcon icon="ri-article-line" />
              </VAvatar>
              <div class="flex-grow-1">
                <div class="text-subtitle-1 font-weight-medium">{{ actualite.titre }}</div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ actualite.categorie }} • {{ formatDate(actualite.date_publication) }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Par {{ actualite.auteur }}
                </div>
              </div>
            </div>
          </VCardText>
        </VCard>

        <VAlert type="error" variant="tonal" class="mb-4">
          <div class="text-subtitle-2 mb-2">⚠️ Attention</div>
          <div class="text-body-2">{{ t('actualites.modal.delete.warning') }}</div>
        </VAlert>

        <!-- Liste des éléments qui seront supprimés -->
        <div class="text-body-2 mb-4">
          <div class="text-subtitle-2 mb-2">Les éléments suivants seront supprimés :</div>
          <ul class="ml-4">
            <li>L'actualité et tout son contenu</li>
            <li v-if="actualite?.image_url">L'image principale</li>
            <li v-if="actualite?.document_url">Le document joint</li>
            <li>Toutes les métadonnées associées</li>
          </ul>
        </div>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-6">
        <VSpacer />
        <VBtn color="grey" variant="outlined" @click="onCancel" :disabled="loading">
          {{ t('actualites.actions.cancel') }}
        </VBtn>
        <VBtn color="error" variant="flat" @click="onConfirmDelete" :loading="loading">
          <VIcon start icon="ri-delete-bin-line" />
          {{ t('actualites.modal.delete.confirmButton') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Actualite } from '@/composables/useActualites'

interface Props {
  modelValue: boolean
  actualite?: Actualite | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'deleted', actualite: Actualite): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

// Reactive state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)

// Methods
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const onCancel = () => {
  isOpen.value = false
}

const onConfirmDelete = async () => {
  if (!props.actualite) return

  loading.value = true
  
  try {
    emit('deleted', props.actualite)
    isOpen.value = false
  } catch (err: any) {
    console.error('Erreur lors de la suppression:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
ul {
  list-style-type: disc;
}

li {
  margin-bottom: 4px;
}
</style>
