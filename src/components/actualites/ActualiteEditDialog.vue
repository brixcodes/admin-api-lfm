<template>
  <VDialog v-model="isOpen" max-width="1200" persistent>
    <VCard>
      <VCardTitle class="text-h5 pa-6 pb-4">
        <div class="d-flex align-center">
          <VAvatar size="40" color="warning" variant="tonal" class="me-3">
            <VIcon icon="ri-edit-line" />
          </VAvatar>
          <div>
            <div class="text-h5">{{ t('actualites.modal.edit.title') }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ t('actualites.modal.edit.subtitle') }}</div>
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
            <VCol cols="12" md="8">
              <VTextField v-model="form.titre" :label="t('actualites.form.title')" :rules="[rules.required]"
                variant="outlined" density="compact" @input="generateSlugFromTitle" />
            </VCol>

            <!-- Catégorie -->
            <VCol cols="12" md="4">
              <VSelect v-model="form.categorie" :label="t('actualites.form.category')" :items="categorieOptions"
                :rules="[rules.required]" variant="outlined" density="compact" />
            </VCol>

            <!-- Slug -->
            <VCol cols="12">
              <VTextField v-model="form.slug" :label="t('actualites.form.slug')" :rules="[rules.required]"
                variant="outlined" density="compact" :hint="t('actualites.form.slugHint')" persistent-hint />
            </VCol>

            <!-- Chapeau -->
            <VCol cols="12">
              <VTextarea v-model="form.chapeau" :label="t('actualites.form.summary')" :rules="[rules.required]"
                variant="outlined" rows="3" :hint="t('actualites.form.summaryHint')" persistent-hint />
            </VCol>

            <!-- Contenu -->
            <VCol cols="12">
              <div class="mb-2">
                <label class="text-subtitle-2 font-weight-medium">{{ t('actualites.form.content') }} *</label>
              </div>
              <RichTextEditor v-model="form.contenu_html" />
            </VCol>

            <!-- Date de publication -->
            <VCol cols="12" md="4">
              <VTextField v-model="form.date_publication" :label="t('actualites.form.publicationDate')"
                :rules="[rules.required]" type="date" variant="outlined" density="compact" />
            </VCol>

            <!-- Auteur -->
            <VCol cols="12" md="4">
              <VTextField v-model="form.auteur" :label="t('actualites.form.author')" :rules="[rules.required]"
                variant="outlined" density="compact" />
            </VCol>

            <!-- Dates de formation (optionnelles) -->
            <VCol cols="12" md="6">
              <VTextField v-model="form.date_debut_formation" :label="t('actualites.form.trainingStartDate')"
                type="date" variant="outlined" density="compact" :hint="t('actualites.form.optional')"
                persistent-hint />
            </VCol>

            <VCol cols="12" md="6">
              <VTextField v-model="form.date_fin_formation" :label="t('actualites.form.trainingEndDate')" type="date"
                variant="outlined" density="compact" :hint="t('actualites.form.optional')" persistent-hint />
            </VCol>

            <!-- Upload d'image -->
            <VCol cols="12" md="6">
              <VFileInput v-model="imageFile" :label="t('actualites.form.mainImage')" accept="image/*"
                variant="outlined" density="compact" prepend-icon="ri-image-line" @change="onImageUpload"
                :loading="uploading" />
              <div v-if="form.image_url" class="mt-2">
                <VImg :src="form.image_url" height="100" cover class="rounded" />
                <VChip color="success" size="small" class="mt-1">
                  <VIcon start icon="ri-check-line" />
                  Image actuelle
                </VChip>
              </div>
            </VCol>

            <!-- Upload de document -->
            <VCol cols="12" md="6">
              <VFileInput v-model="documentFile" :label="t('actualites.form.attachedDocument')" accept=".pdf,.doc,.docx"
                variant="outlined" density="compact" prepend-icon="ri-file-line" @change="onDocumentUpload"
                :loading="uploading" />
              <div v-if="form.document_url" class="mt-2">
                <VChip color="success" size="small">
                  <VIcon start icon="ri-check-line" />
                  Document actuel
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
          {{ t('actualites.actions.cancel') }}
        </VBtn>
        <VBtn color="primary" variant="flat" @click="onSubmit" :loading="loading">
          {{ t('actualites.actions.save') }}
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
              <div class="text-h5">{{ t('actualites.modal.edit.confirm.title') }}</div>
              <div class="text-body-2 text-medium-emphasis">{{ t('actualites.modal.edit.confirm.subtitle') }}</div>
            </div>
          </div>
        </VCardTitle>

        <VDivider />

        <VCardText class="pa-6">
          <div class="text-body-1 mb-4">{{ t('actualites.modal.edit.confirm.message') }}</div>

          <!-- Actualité Summary -->
          <VCard variant="tonal" color="secondary" class="mb-4">
            <VCardText class="pa-4">
              <div class="text-subtitle-2 mb-2">{{ t('actualites.modal.edit.confirm.summary') }}</div>
              <div class="d-flex flex-column gap-2">
                <div><strong>{{ t('actualites.form.title') }}:</strong> {{ form.titre }}</div>
                <div><strong>{{ t('actualites.form.category') }}:</strong> {{ form.categorie }}</div>
                <div><strong>{{ t('actualites.form.author') }}:</strong> {{ form.auteur }}</div>
                <div><strong>{{ t('actualites.form.publicationDate') }}:</strong> {{ formatDate(form.date_publication)
                  }}</div>
                <div><strong>{{ t('actualites.form.summary') }}:</strong> {{ form.chapeau.substring(0, 100) }}{{
                  form.chapeau.length > 100 ? '...' : '' }}</div>
                <div v-if="form.image_url"><strong>Image:</strong> ✓ Présente</div>
                <div v-if="form.document_url"><strong>Document:</strong> ✓ Présent</div>
                <div v-if="form.date_debut_formation"><strong>{{ t('actualites.form.trainingStartDate') }}:</strong> {{
                  formatDate(form.date_debut_formation) }}</div>
                <div v-if="form.date_fin_formation"><strong>{{ t('actualites.form.trainingEndDate') }}:</strong> {{
                  formatDate(form.date_fin_formation) }}</div>
              </div>
            </VCardText>
          </VCard>

          <VAlert type="info" variant="tonal" :text="t('actualites.modal.edit.confirm.info')" />
        </VCardText>

        <VDivider />

        <VCardActions class="pa-6">
          <VSpacer />
          <VBtn color="error" variant="outlined" @click="showConfirmDialog = false" :disabled="loading">
            {{ t('actualites.actions.cancel') }}
          </VBtn>
          <VBtn color="primary" variant="flat" @click="onConfirmUpdate" :loading="loading">
            {{ t('actualites.modal.edit.confirm.save') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import RichTextEditor from '@/components/RichTextEditorSimple.vue'
import type { Actualite, CreateActualitePayload } from '@/composables/useActualites'
import { useActualites } from '@/composables/useActualites'

interface Props {
  modelValue: boolean
  actualite?: Actualite | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'updated', data: CreateActualitePayload): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const { uploadFile, generateSlug } = useActualites()

// Reactive state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Form state
const form = ref<CreateActualitePayload>({
  titre: '',
  slug: '',
  categorie: '',
  chapeau: '',
  contenu_html: '',
  image_url: '',
  date_publication: '',
  date_debut_formation: '',
  date_fin_formation: '',
  document_url: '',
  auteur: '',
  utilisateur_id: 1
})

const formRef = ref()
const error = ref('')
const loading = ref(false)
const uploading = ref(false)
const showConfirmDialog = ref(false)
const imageFile = ref<File[]>([])
const documentFile = ref<File[]>([])

// Options
const categorieOptions = [
  'Actualité',
  'Formation',
  'Événement',
  'Annonce',
  'Information'
]

// Validation rules
const rules = {
  required: (value: string) => !!value || 'Ce champ est requis'
}

// Methods
const generateSlugFromTitle = () => {
  if (form.value.titre) {
    form.value.slug = generateSlug(form.value.titre)
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const loadActualiteData = () => {
  if (props.actualite) {
    form.value = {
      titre: props.actualite.titre,
      slug: props.actualite.slug,
      categorie: props.actualite.categorie,
      chapeau: props.actualite.chapeau,
      contenu_html: props.actualite.contenu_html,
      image_url: props.actualite.image_url || '',
      date_publication: props.actualite.date_publication,
      date_debut_formation: props.actualite.date_debut_formation || '',
      date_fin_formation: props.actualite.date_fin_formation || '',
      document_url: props.actualite.document_url || '',
      auteur: props.actualite.auteur,
      utilisateur_id: props.actualite.utilisateur_id
    }
  }
}

const onCancel = () => {
  isOpen.value = false
}

const onSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  // Show confirmation dialog instead of updating directly
  showConfirmDialog.value = true
}

const onConfirmUpdate = async () => {
  loading.value = true
  error.value = ''

  try {
    // Nettoyer les données avant envoi (exclure utilisateur_id et autres champs non modifiables)
    const cleanData = {
      titre: form.value.titre,
      slug: form.value.slug,
      categorie: form.value.categorie,
      chapeau: form.value.chapeau,
      contenu_html: form.value.contenu_html,
      image_url: form.value.image_url,
      date_publication: form.value.date_publication,
      auteur: form.value.auteur,
      // Inclure les dates de formation seulement si elles sont renseignées
      ...(form.value.date_debut_formation && { date_debut_formation: form.value.date_debut_formation }),
      ...(form.value.date_fin_formation && { date_fin_formation: form.value.date_fin_formation }),
      ...(form.value.document_url && { document_url: form.value.document_url })
    }

    emit('updated', cleanData)
    showConfirmDialog.value = false
    isOpen.value = false
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la modification'
  } finally {
    loading.value = false
  }
}

const onImageUpload = async (event: Event) => {
  const files = imageFile.value
  if (!files || files.length === 0) return

  const file = files[0]

  // Vérifier que le fichier existe et a un type
  if (!file || !file.type) {
    error.value = 'Fichier invalide'
    return
  }

  if (!file.type.startsWith('image/')) {
    error.value = 'Veuillez sélectionner une image valide'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    error.value = 'L\'image ne doit pas dépasser 5MB'
    return
  }

  try {
    uploading.value = true
    const response = await uploadFile(file, 'image')
    form.value.image_url = response.url
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de l\'upload de l\'image'
  } finally {
    uploading.value = false
  }
}

const onDocumentUpload = async (event: Event) => {
  const files = documentFile.value
  if (!files || files.length === 0) return

  const file = files[0]

  // Vérifier que le fichier existe et a un type
  if (!file || !file.type) {
    error.value = 'Fichier invalide'
    return
  }

  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

  if (!allowedTypes.includes(file.type)) {
    error.value = 'Veuillez sélectionner un fichier PDF ou Word'
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    error.value = 'Le document ne doit pas dépasser 10MB'
    return
  }

  try {
    uploading.value = true
    const response = await uploadFile(file, 'document')
    form.value.document_url = response.url
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de l\'upload du document'
  } finally {
    uploading.value = false
  }
}

// Watch for dialog open/close and actualite changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    loadActualiteData()
  }
})

watch(() => props.actualite, () => {
  if (props.modelValue) {
    loadActualiteData()
  }
})
</script>
