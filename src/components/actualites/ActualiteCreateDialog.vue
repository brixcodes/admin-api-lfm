<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import RichTextEditor from '@/components/RichTextEditorSimple.vue'
import type { CreateActualitePayload } from '@/composables/useActualites'
import { useActualites } from '@/composables/useActualites'
import { useAuthStore } from '@/stores/auth'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', data: CreateActualitePayload): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const { uploadFile, generateSlug } = useActualites()
const authStore = useAuthStore()

// Debug de l'authentification AVANT toute modification
console.log('=== DEBUG AUTH STORE (AVANT) ===')
console.log('User avant:', authStore.user)
console.log('User ID avant:', authStore.userId)
console.log('Is authenticated avant:', authStore.isAuthenticated)
console.log('Token:', authStore.token)

// Essayer de récupérer l'utilisateur connecté depuis l'API
if (authStore.token && !authStore.user) {
  console.log('Token présent mais pas d\'utilisateur, récupération depuis l\'API...')
  authStore.fetchCurrentUser().then(() => {
    console.log('=== UTILISATEUR RÉCUPÉRÉ DEPUIS L\'API ===')
    console.log('User récupéré:', authStore.user)
    console.log('User ID récupéré:', authStore.userId)
  }).catch(error => {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    console.log('Utilisation de l\'utilisateur démo')
    authStore.initDemoUser()
  })
}
else if (!authStore.user && !authStore.token) {
  console.log('Aucun utilisateur connecté, initialisation utilisateur démo')
  authStore.initDemoUser()
}

// Debug de l'authentification APRÈS
console.log('=== DEBUG AUTH STORE (APRÈS) ===')
console.log('User après:', authStore.user)
console.log('User ID après:', authStore.userId)
console.log('Is authenticated après:', authStore.isAuthenticated)

// Reactive state
const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

// Form state
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
  utilisateur_id: (() => {
    const userId = authStore.userId || 1

    console.log('=== INITIALISATION FORMULAIRE ===')
    console.log('authStore.userId:', authStore.userId)
    console.log('userId utilisé:', userId)

    return userId
  })(),
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
  'Événement',
  'Annonce',
  'Information',
]

// Validation rules
const rules = {
  required: (value: string) => !!value || 'Ce champ est requis',
}

// Methods
const generateSlugFromTitle = () => {
  if (form.value.titre)
    form.value.slug = generateSlug(form.value.titre)
}

const formatDate = (dateString: string) => {
  if (!dateString)
    return ''

  return new Date(dateString).toLocaleDateString('fr-FR')
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
    utilisateur_id: authStore.userId || 1,
  }
  imageFile.value = []
  documentFile.value = []
  error.value = ''
  formRef.value?.resetValidation()
}

const onCancel = () => {
  resetForm()
  isOpen.value = false
}

const onSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid)
    return

  // Show confirmation dialog instead of creating directly
  showConfirmDialog.value = true
}

const onConfirmCreate = async () => {
  loading.value = true
  error.value = ''

  try {
    console.log('=== DONNÉES ENVOYÉES POUR CRÉATION ===')
    console.log('Form data avant copie:', form.value)
    console.log('Image URL avant copie:', form.value.image_url)
    console.log('Document URL avant copie:', form.value.document_url)

    // Créer une copie des données avant de réinitialiser le formulaire
    const formData = { ...form.value }

    console.log('=== COPIE DES DONNÉES ===')
    console.log('Form data copié:', formData)
    console.log('Image URL copié:', formData.image_url)
    console.log('Document URL copié:', formData.document_url)

    emit('created', formData)

    // Réinitialiser le formulaire APRÈS avoir émis les données
    resetForm()
    showConfirmDialog.value = false
    isOpen.value = false
  }
  catch (err: any) {
    error.value = err.message || 'Erreur lors de la création'
  }
  finally {
    loading.value = false
  }
}

const onImageUpload = async (event: Event) => {
  // Récupérer les fichiers directement depuis l'événement
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0)
    return

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

    console.log('Réponse upload image:', response)

    // S'assurer que l'URL est complète
    form.value.image_url = response.url
    console.log('URL image sauvegardée:', form.value.image_url)
    console.log('Form complet après upload image:', form.value)
  }
  catch (err: any) {
    console.error('Erreur upload image:', err)
    error.value = err.message || 'Erreur lors de l\'upload de l\'image'
  }
  finally {
    uploading.value = false
  }
}

const onDocumentUpload = async (event: Event) => {
  // Récupérer les fichiers directement depuis l'événement
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0)
    return

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

    console.log('Réponse upload document:', response)

    // S'assurer que l'URL est complète
    form.value.document_url = response.url
    console.log('URL document sauvegardée:', form.value.document_url)
    console.log('Form complet après upload document:', form.value)
  }
  catch (err: any) {
    console.error('Erreur upload document:', err)
    error.value = err.message || 'Erreur lors de l\'upload du document'
  }
  finally {
    uploading.value = false
  }
}

// Watch for dialog open/close
watch(() => props.modelValue, newValue => {
  if (newValue)
    resetForm()
})
</script>

<template>
  <VDialog v-model="isOpen" max-width="1200" persistent>
    <VCard>
      <VCardTitle class="text-h5 pa-6 pb-4">
        <div class="d-flex align-center">
          <VAvatar size="40" color="primary" variant="tonal" class="me-3">
            <VIcon icon="ri-article-line" />
          </VAvatar>
          <div>
            <div class="text-h5">
              {{ t('actualites.modal.create.title') }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ t('actualites.modal.create.subtitle') }}
            </div>
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
              <VTextField v-model="form.date_debut_formation" :label="t('actualites.form.dateDebutFormation')"
                type="date" variant="outlined" density="compact" hint="Optionnel - pour les formations"
                persistent-hint />
            </VCol>

            <VCol cols="12" md="6">
              <VTextField v-model="form.date_fin_formation" :label="t('actualites.form.dateFinFormation')" type="date"
                variant="outlined" density="compact" hint="Optionnel - pour les formations" persistent-hint />
            </VCol>

            <!-- Upload d'image -->
            <VCol cols="12" md="6">
              <VFileInput v-model="imageFile" :label="t('actualites.form.image')" accept="image/*" variant="outlined"
                density="compact" prepend-icon="ri-image-line" :loading="uploading" @change="onImageUpload" />
              <div v-if="form.image_url" class="mt-2">
                <VImg :src="form.image_url" height="100" cover class="rounded mb-2" />
                <VChip color="success" size="small">
                  <VIcon start icon="ri-check-line" />
                  Image uploadée
                </VChip>
              </div>
            </VCol>

            <!-- Upload de document -->
            <VCol cols="12" md="6">
              <VFileInput v-model="documentFile" :label="t('actualites.form.document')" accept=".pdf,.doc,.docx"
                variant="outlined" density="compact" prepend-icon="ri-file-line" :loading="uploading"
                @change="onDocumentUpload" />
              <div v-if="form.document_url" class="mt-2">
                <VChip color="success" size="small">
                  <VIcon start icon="ri-check-line" />
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
        <VBtn color="error" variant="outlined" :disabled="loading" @click="onCancel">
          {{ t('common.cancel') }}
        </VBtn>
        <VBtn color="primary" variant="flat" :loading="loading" @click="onSubmit">
          {{ t('actualites.create.submit') }}
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
              <div class="text-h5">
                {{ t('actualites.modal.create.confirm.title') }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ t('actualites.modal.create.confirm.subtitle') }}
              </div>
            </div>
          </div>
        </VCardTitle>

        <VDivider />

        <VCardText class="pa-6">
          <div class="text-body-1 mb-4">
            {{ t('actualites.modal.create.confirm.message') }}
          </div>

          <!-- Actualité Summary -->
          <VCard variant="tonal" color="secondary" class="mb-4">
            <VCardText class="pa-4">
              <div class="text-subtitle-2 mb-2">
                {{ t('actualites.modal.create.confirm.summary') }}
              </div>
              <div class="d-flex flex-column gap-2">
                <div><strong>{{ t('actualites.form.titre') }}:</strong> {{ form.titre }}</div>
                <div><strong>{{ t('actualites.form.categorie') }}:</strong> {{ form.categorie }}</div>
                <div><strong>{{ t('actualites.form.auteur') }}:</strong> {{ form.auteur }}</div>
                <div>
                  <strong>{{ t('actualites.form.datePublication') }}:</strong> {{ formatDate(form.date_publication)
                  }}
                </div>
                <div>
                  <strong>{{ t('actualites.form.chapeau') }}:</strong> {{ form.chapeau.substring(0, 100) }}{{
                    form.chapeau.length > 100 ? '...' : '' }}
                </div>
                <div v-if="form.image_url">
                  <strong>Image:</strong> ✓ Uploadée
                  <br>
                  <small class="text-caption text-disabled">{{ form.image_url }}</small>
                </div>
                <div v-if="form.document_url">
                  <strong>Document:</strong> ✓ Uploadé
                  <br>
                  <small class="text-caption text-disabled">{{ form.document_url }}</small>
                </div>
                <div v-if="form.date_debut_formation">
                  <strong>{{ t('actualites.form.dateDebutFormation') }}:</strong> {{
                    formatDate(form.date_debut_formation) }}
                </div>
                <div v-if="form.date_fin_formation">
                  <strong>{{ t('actualites.form.dateFinFormation') }}:</strong> {{ formatDate(form.date_fin_formation)
                  }}
                </div>
              </div>
            </VCardText>
          </VCard>

          <VAlert type="info" variant="tonal" :text="t('actualites.modal.create.confirm.info')" />
        </VCardText>

        <VDivider />

        <VCardActions class="pa-6">
          <VSpacer />
          <VBtn color="error" variant="outlined" :disabled="loading" @click="showConfirmDialog = false">
            {{ t('common.cancel') }}
          </VBtn>
          <VBtn color="primary" variant="flat" :loading="loading" @click="onConfirmCreate">
            {{ t('actualites.modal.create.confirm.create') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VDialog>
</template>
