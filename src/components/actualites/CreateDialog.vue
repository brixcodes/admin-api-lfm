<template>
  <VDialog v-model="isOpen" max-width="1200" persistent>
    <VCard>
      <VCardTitle class="text-h5 pa-6 pb-4">
        <div class="d-flex align-center">
          <VAvatar size="40" color="primary" variant="tonal" class="me-3">
            <VIcon icon="ri-article-line" />
          </VAvatar>
          <div>
            <div class="text-h5">Nouvelle actualité</div>
            <div class="text-body-2 text-medium-emphasis">Créer une nouvelle actualité</div>
          </div>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-6">
        <!-- Message d'erreur -->
        <VAlert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = null">
          {{ error }}
        </VAlert>

        <VForm ref="formRef" @submit.prevent="onSubmit">
          <VRow>
            <!-- Titre -->
            <VCol cols="12" md="6">
              <VTextField v-model="form.titre" :label="$t('actualites.form.title')"
                :placeholder="$t('actualites.form.titleRequired')" variant="outlined" prepend-inner-icon="ri-text"
                :rules="[rules.required]" required @input="generateSlugFromTitle" />
            </VCol>

            <!-- Slug -->
            <VCol cols="12" md="6">
              <VTextField v-model="form.slug" :label="$t('actualites.form.slug')"
                :placeholder="$t('actualites.form.slugPlaceholder')" variant="outlined" prepend-inner-icon="ri-link"
                :rules="[rules.required]" required />
            </VCol>

            <!-- Catégorie -->
            <VCol cols="12" md="6">
              <VSelect v-model="form.categorie" :label="$t('actualites.form.category')" :items="categorieOptions"
                variant="outlined" prepend-inner-icon="ri-folder-line" :rules="[rules.required]" required />
            </VCol>

            <!-- Auteur -->
            <VCol cols="12" md="6">
              <VTextField v-model="form.auteur" :label="$t('actualites.form.author')"
                :placeholder="$t('actualites.form.authorPlaceholder')" variant="outlined"
                prepend-inner-icon="ri-user-line" :rules="[rules.required]" required />
            </VCol>

            <!-- Date de publication -->
            <VCol cols="12" md="4">
              <VTextField v-model="form.date_publication" :label="$t('actualites.form.publicationDate')" type="date"
                variant="outlined" prepend-inner-icon="ri-calendar-line" :rules="[rules.required]" required />
            </VCol>

            <!-- Date début formation (optionnel) -->
            <VCol cols="12" md="4">
              <VTextField v-model="form.date_debut_formation" :label="$t('actualites.form.trainingStartDate')"
                type="date" variant="outlined" prepend-inner-icon="ri-calendar-event-line" />
            </VCol>

            <!-- Date fin formation (optionnel) -->
            <VCol cols="12" md="4">
              <VTextField v-model="form.date_fin_formation" :label="$t('actualites.form.trainingEndDate')" type="date"
                variant="outlined" prepend-inner-icon="ri-calendar-event-line" />
            </VCol>

            <!-- Chapeau -->
            <VCol cols="12">
              <VTextarea v-model="form.chapeau" :label="$t('actualites.form.summary')"
                :placeholder="$t('actualites.form.summaryHint')" variant="outlined" rows="3" :rules="[rules.required]"
                required />
            </VCol>

            <!-- Contenu HTML -->
            <VCol cols="12">
              <label class="text-subtitle-2 text-high-emphasis mb-2 d-block">
                Contenu *
              </label>
              <RichTextEditor v-model="form.contenu_html" />
            </VCol>

            <!-- Upload Image -->
            <VCol cols="12" md="6">
              <VFileInput v-model="imageFile" :label="$t('actualites.form.mainImage')" accept="image/*"
                variant="outlined" prepend-inner-icon="ri-image-line" @change="onImageUpload" :loading="uploading" />
              <div v-if="form.image_url" class="mt-2">
                <VImg :src="form.image_url" max-height="200" class="rounded" />
              </div>
            </VCol>

            <!-- Upload Document -->
            <VCol cols="12" md="6">
              <VFileInput v-model="documentFile" :label="$t('actualites.form.attachedDocument')"
                accept=".pdf,.doc,.docx" variant="outlined" prepend-inner-icon="ri-file-line" @change="onDocumentUpload"
                :loading="uploading" />
              <div v-if="form.document_url" class="mt-2">
                <VChip color="success" prepend-icon="ri-file-check-line">
                  Document uploadé
                </VChip>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-6">
        <VSpacer />
        <VBtn color="error" variant="outlined" @click="onCancel" :disabled="loading">
          Annuler
        </VBtn>
        <VBtn color="primary" variant="flat" @click="onSubmit" :loading="loading">
          Créer l'actualité
        </VBtn>
      </VCardActions>
    </VCard>

    <!-- Confirmation Dialog -->
    <VDialog v-model="showConfirmDialog" max-width="600" persistent>
      <VCard>
        <VCardTitle class="text-h5 pa-6 pb-4">
          <div class="d-flex align-center">
            <VAvatar size="40" color="warning" variant="tonal" class="me-3">
              <VIcon icon="ri-question-line" />
            </VAvatar>
            <div>
              <div class="text-h5">Confirmer la création</div>
              <div class="text-body-2 text-medium-emphasis">Vérifiez les informations avant de créer l'actualité</div>
            </div>
          </div>
        </VCardTitle>

        <VCardText class="pa-6">
          <VCard variant="outlined" class="mb-4">
            <VCardText>
              <div class="mb-3">
                <strong>Titre:</strong> {{ form.titre }}
              </div>
              <div class="mb-3">
                <strong>Catégorie:</strong> {{ form.categorie }}
              </div>
              <div class="mb-3">
                <strong>Auteur:</strong> {{ form.auteur }}
              </div>
              <div class="mb-3">
                <strong>Date de publication:</strong> {{ formatDate(form.date_publication) }}
              </div>
              <div v-if="form.date_debut_formation" class="mb-3">
                <strong>Date début formation:</strong> {{ formatDate(form.date_debut_formation) }}
              </div>
              <div v-if="form.date_fin_formation" class="mb-3">
                <strong>Date fin formation:</strong> {{ formatDate(form.date_fin_formation) }}
              </div>
              <div class="mb-3">
                <strong>Chapeau:</strong> {{ form.chapeau }}
              </div>
              <div v-if="form.image_url" class="mb-3">
                <strong>Image:</strong>
                <VChip color="success" size="small" class="ml-2">Incluse</VChip>
              </div>
              <div v-if="form.document_url" class="mb-3">
                <strong>Document:</strong>
                <VChip color="success" size="small" class="ml-2">Inclus</VChip>
              </div>
            </VCardText>
          </VCard>

          <VAlert type="info" variant="tonal" text="L'actualité sera créée et visible immédiatement." />
        </VCardText>

        <VDivider />

        <VCardActions class="pa-6">
          <VSpacer />
          <VBtn color="error" variant="outlined" @click="showConfirmDialog = false" :disabled="loading">
            Annuler
          </VBtn>
          <VBtn color="primary" variant="flat" @click="onConfirmCreate" :loading="loading">
            Créer l'actualité
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import RichTextEditor from '@/components/RichTextEditorSimple.vue'
import { useActualites } from '@/composables/useActualites'
import type { CreateActualitePayload } from '@/composables/useActualites'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', actualite: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { generateSlug, uploadFile } = useActualites()

// Refs
const formRef = ref()
const loading = ref(false)
const uploading = ref(false)
const showConfirmDialog = ref(false)
const error = ref<string | null>(null)
const imageFile = ref<File[]>([])
const documentFile = ref<File[]>([])

// Form data
const form = ref<CreateActualitePayload>({
  titre: '',
  slug: '',
  categorie: '',
  chapeau: '',
  contenu_html: '',
  image_url: '',
  date_publication: new Date().toISOString().split('T')[0],
  date_debut_formation: '',
  date_fin_formation: '',
  document_url: '',
  auteur: '',
  utilisateur_id: 1
})

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const categorieOptions = [
  { title: 'Formation', value: 'Formation' },
  { title: 'Actualité', value: 'Actualité' },
  { title: 'Événement', value: 'Événement' },
  { title: 'Annonce', value: 'Annonce' }
]

// Validation rules
const rules = {
  required: (value: string) => !!value || 'Ce champ est requis',
}

// Methods
const generateSlugFromTitle = () => {
  if (form.value.titre && !form.value.slug) {
    form.value.slug = generateSlug(form.value.titre)
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const onImageUpload = async () => {
  if (!imageFile.value?.[0]) return

  try {
    uploading.value = true
    const response = await uploadFile(imageFile.value[0], 'image')
    form.value.image_url = response.url
  } catch (err) {
    console.error('Erreur upload image:', err)
    error.value = 'Erreur lors de l\'upload de l\'image'
  } finally {
    uploading.value = false
  }
}

const onDocumentUpload = async () => {
  if (!documentFile.value?.[0]) return

  try {
    uploading.value = true
    const response = await uploadFile(documentFile.value[0], 'document')
    form.value.document_url = response.url
  } catch (err) {
    console.error('Erreur upload document:', err)
    error.value = 'Erreur lors de l\'upload du document'
  } finally {
    uploading.value = false
  }
}

const resetForm = () => {
  form.value = {
    titre: '',
    slug: '',
    categorie: '',
    chapeau: '',
    contenu_html: '',
    image_url: '',
    date_publication: new Date().toISOString().split('T')[0],
    date_debut_formation: '',
    date_fin_formation: '',
    document_url: '',
    auteur: '',
    utilisateur_id: 1
  }
  imageFile.value = []
  documentFile.value = []
  error.value = null
}

const onCancel = () => {
  resetForm()
  isOpen.value = false
}

const onSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  // Show confirmation dialog instead of creating directly
  showConfirmDialog.value = true
}

const onConfirmCreate = async () => {
  loading.value = true
  error.value = null

  try {
    emit('created', form.value)
    resetForm()
    showConfirmDialog.value = false
    isOpen.value = false
  } catch (error: any) {
    console.error('Erreur création actualité:', error)
    error.value = error.message || 'Erreur lors de la création'
  } finally {
    loading.value = false
  }
}

// Watch for dialog close
watch(isOpen, (newValue) => {
  if (!newValue) {
    showConfirmDialog.value = false
    resetForm()
  }
})
</script>
