<template>
  <VDialog v-model="isOpen" max-width="900" persistent>
    <VCard v-if="actualite">
      <VCardTitle class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <VAvatar size="40" color="primary" variant="tonal" class="me-3">
            <VIcon icon="ri-article-line" />
          </VAvatar>
          <div>
            <div class="text-h5">{{ t('actualites.details.title') }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ t('actualites.details.subtitle') }}</div>
          </div>
        </div>
        <VBtn icon variant="text" size="small" @click="closeDialog">
          <VIcon icon="ri-close-line" />
        </VBtn>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-0">
        <VTabs v-model="activeTab" color="primary" class="px-6">
          <VTab value="overview">
            <VIcon start icon="ri-eye-line" />
            {{ t('actualites.details.tabs.overview') }}
          </VTab>
          <VTab value="content">
            <VIcon start icon="ri-file-text-line" />
            {{ t('actualites.details.tabs.content') }}
          </VTab>
          <VTab value="files">
            <VIcon start icon="ri-attachment-line" />
            {{ t('actualites.details.tabs.files') }}
          </VTab>
        </VTabs>

        <VDivider />

        <VTabsWindow v-model="activeTab" class="pa-6">
          <!-- Overview Tab -->
          <VTabsWindowItem value="overview">
            <VRow>
              <!-- Image de l'actualité -->
              <VCol v-if="actualite.image_url" cols="12" md="4">
                <VCard variant="outlined">
                  <VImg
                    :src="actualite.image_url"
                    :alt="actualite.titre"
                    height="200"
                    cover
                    class="rounded"
                  />
                </VCard>
              </VCol>

              <!-- Informations principales -->
              <VCol cols="12" :md="actualite.image_url ? 8 : 12">
                <div class="d-flex flex-column gap-4">
                  <!-- Titre et catégorie -->
                  <div>
                    <h2 class="text-h4 mb-2">{{ actualite.titre }}</h2>
                    <VChip :color="getCategorieColor(actualite.categorie)" size="small" class="mb-2">
                      {{ actualite.categorie }}
                    </VChip>
                  </div>

                  <!-- Chapeau -->
                  <div>
                    <h3 class="text-h6 mb-2">{{ t('actualites.form.chapeau') }}</h3>
                    <p class="text-body-1">{{ actualite.chapeau }}</p>
                  </div>

                  <!-- Métadonnées -->
                  <VCard variant="tonal" color="secondary">
                    <VCardText class="pa-4">
                      <div class="d-flex flex-column gap-2">
                        <div class="d-flex align-center">
                          <VIcon icon="ri-user-line" class="me-2" size="16" />
                          <span class="text-body-2"><strong>{{ t('actualites.form.auteur') }}:</strong> {{ actualite.auteur }}</span>
                        </div>
                        <div class="d-flex align-center">
                          <VIcon icon="ri-calendar-line" class="me-2" size="16" />
                          <span class="text-body-2"><strong>{{ t('actualites.form.datePublication') }}:</strong> {{ formatDate(actualite.date_publication) }}</span>
                        </div>
                        <div v-if="actualite.date_debut_formation" class="d-flex align-center">
                          <VIcon icon="ri-calendar-event-line" class="me-2" size="16" />
                          <span class="text-body-2"><strong>{{ t('actualites.form.dateDebutFormation') }}:</strong> {{ formatDate(actualite.date_debut_formation) }}</span>
                        </div>
                        <div v-if="actualite.date_fin_formation" class="d-flex align-center">
                          <VIcon icon="ri-calendar-event-line" class="me-2" size="16" />
                          <span class="text-body-2"><strong>{{ t('actualites.form.dateFinFormation') }}:</strong> {{ formatDate(actualite.date_fin_formation) }}</span>
                        </div>
                        <div class="d-flex align-center">
                          <VIcon icon="ri-link" class="me-2" size="16" />
                          <span class="text-body-2"><strong>Slug:</strong> {{ actualite.slug }}</span>
                        </div>
                      </div>
                    </VCardText>
                  </VCard>
                </div>
              </VCol>
            </VRow>

            <!-- Actions -->
            <VDivider class="my-6" />
            <div class="d-flex flex-row gap-2">
              <VBtn color="primary" variant="flat" @click="emit('edit-actualite', actualite)">
                <VIcon start icon="ri-edit-line" />
                {{ t('actualites.actions.edit') }}
              </VBtn>
              <VBtn color="error" variant="outlined" @click="emit('delete-actualite', actualite)">
                <VIcon start icon="ri-delete-bin-line" />
                {{ t('actualites.actions.delete') }}
              </VBtn>
            </div>
          </VTabsWindowItem>

          <!-- Content Tab -->
          <VTabsWindowItem value="content">
            <div class="content-preview">
              <h3 class="text-h6 mb-4">{{ t('actualites.details.content.title') }}</h3>
              <VCard variant="outlined" class="pa-4">
                <div v-html="actualite.contenu_html" class="content-html"></div>
              </VCard>
            </div>
          </VTabsWindowItem>

          <!-- Files Tab -->
          <VTabsWindowItem value="files">
            <div class="d-flex flex-column gap-4">
              <h3 class="text-h6">{{ t('actualites.details.files.title') }}</h3>
              
              <!-- Image -->
              <div v-if="actualite.image_url">
                <h4 class="text-subtitle-1 mb-2">{{ t('actualites.details.files.image') }}</h4>
                <VCard variant="outlined" class="pa-4">
                  <div class="d-flex align-center gap-3">
                    <VAvatar size="40" color="primary" variant="tonal">
                      <VIcon icon="ri-image-line" />
                    </VAvatar>
                    <div class="flex-grow-1">
                      <div class="text-subtitle-2">Image de l'actualité</div>
                      <div class="text-body-2 text-medium-emphasis">{{ getFileName(actualite.image_url) }}</div>
                    </div>
                    <VBtn
                      icon
                      variant="text"
                      size="small"
                      :href="actualite.image_url"
                      target="_blank"
                    >
                      <VIcon icon="ri-external-link-line" />
                    </VBtn>
                  </div>
                </VCard>
              </div>

              <!-- Document -->
              <div v-if="actualite.document_url">
                <h4 class="text-subtitle-1 mb-2">{{ t('actualites.details.files.document') }}</h4>
                <VCard variant="outlined" class="pa-4">
                  <div class="d-flex align-center gap-3">
                    <VAvatar size="40" color="secondary" variant="tonal">
                      <VIcon icon="ri-file-pdf-line" />
                    </VAvatar>
                    <div class="flex-grow-1">
                      <div class="text-subtitle-2">Document joint</div>
                      <div class="text-body-2 text-medium-emphasis">{{ getFileName(actualite.document_url) }}</div>
                    </div>
                    <VBtn
                      icon
                      variant="text"
                      size="small"
                      :href="actualite.document_url"
                      target="_blank"
                    >
                      <VIcon icon="ri-download-line" />
                    </VBtn>
                  </div>
                </VCard>
              </div>

              <!-- Aucun fichier -->
              <div v-if="!actualite.image_url && !actualite.document_url">
                <VAlert type="info" variant="tonal">
                  {{ t('actualites.details.files.none') }}
                </VAlert>
              </div>
            </div>
          </VTabsWindowItem>
        </VTabsWindow>
      </VCardText>
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
  (e: 'edit-actualite', actualite: Actualite): void
  (e: 'delete-actualite', actualite: Actualite): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

// Reactive state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activeTab = ref('overview')

// Methods
const closeDialog = () => {
  isOpen.value = false
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getCategorieColor = (categorie: string) => {
  const colors: Record<string, string> = {
    'Actualité': 'primary',
    'Formation': 'success',
    'Événement': 'warning',
    'Annonce': 'info',
    'Information': 'secondary'
  }
  return colors[categorie] || 'primary'
}

const getFileName = (url: string) => {
  if (!url) return ''
  const parts = url.split('/')
  return parts[parts.length - 1] || 'Fichier'
}
</script>

<style scoped>
.content-html {
  line-height: 1.6;
}

.content-html h1,
.content-html h2,
.content-html h3,
.content-html h4,
.content-html h5,
.content-html h6 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.content-html p {
  margin-bottom: 1rem;
}

.content-html ul,
.content-html ol {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.content-html img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
}
</style>
