<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { Actualite, CreateActualitePayload } from '@/composables/useActualites'
import RichTextEditor from '@/components/RichTextEditorSimple.vue'
import NotificationToast from '@/components/NotificationToast.vue'
import { useActualites } from '@/composables/useActualites'
import { useGlobalNotifications } from '@/composables/useNotifications'
import { useAuthStore } from '@/stores/auth'

// Traduction
const { t } = useI18n()

// Store auth pour l'utilisateur connecté
const authStore = useAuthStore()

// Composable avec API réelle
const {
  actualites,
  loading,
  error,
  hasMore,
  isEmpty,
  creating,
  updating,
  deleting,
  uploading,
  fetchActualites,
  loadMore,
  createActualite,
  updateActualite,
  deleteActualite,
  uploadFile,
  generateSlug,
} = useActualites()

// États locaux
const searchQuery = ref('')
const selectedCategorie = ref(t('actualites.categories.all'))
const viewMode = ref<'grid' | 'list'>('grid')

// Modals
const showCreateModal = ref(false)
const showViewModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

// Actualité sélectionnée
const selectedActualite = ref<Actualite | null>(null)

// Formulaire
const formData = ref<CreateActualitePayload>({
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
  utilisateur_id: 1, // À adapter selon l'utilisateur connecté
})

// Catégories
const categories = computed(() => [
  t('actualites.categories.all'),
  t('actualites.categories.formation'),
  t('actualites.categories.partnership'),
  t('actualites.categories.event'),
  t('actualites.categories.testimonial'),
  t('actualites.categories.project'),
  t('actualites.categories.certification'),
  t('actualites.categories.communication'),
])

// Computed
const actualitesFiltrees = computed(() => {
  // Sécuriser l'accès au tableau
  if (!actualites.value || !Array.isArray(actualites.value))
    return []

  let filtered = actualites.value

  // Filtre par catégorie
  if (selectedCategorie.value !== t('actualites.categories.all')) {
    // Mapper la catégorie traduite vers la valeur originale
    const categoryMap: Record<string, string> = {
      [t('actualites.categories.formation')]: 'Formation',
      [t('actualites.categories.partnership')]: 'Partenariat',
      [t('actualites.categories.event')]: 'Événement',
      [t('actualites.categories.testimonial')]: 'Témoignage',
      [t('actualites.categories.project')]: 'Projet',
      [t('actualites.categories.certification')]: 'Certification',
      [t('actualites.categories.communication')]: 'Communication',
    }

    const originalCategory = categoryMap[selectedCategorie.value] || selectedCategorie.value

    filtered = filtered.filter(a => a.categorie === originalCategory)
  }

  // Filtre par recherche
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()

    filtered = filtered.filter(a =>
      a.titre?.toLowerCase().includes(query)
      || a.chapeau?.toLowerCase().includes(query)
      || a.auteur?.toLowerCase().includes(query),
    )
  }

  return filtered
})

const actualitesFeatured = computed(() => {
  const filtered = actualitesFiltrees.value

  return Array.isArray(filtered) ? filtered.slice(0, 2) : [] // Les 2 premières comme featured
})

const autresActualites = computed(() => {
  const filtered = actualitesFiltrees.value

  return Array.isArray(filtered) ? filtered.slice(2) : [] // Le reste
})

// Méthodes
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getCategorieColor = (categorie: string) => {
  const colors: Record<string, string> = {
    Formation: 'primary',
    Partenariat: 'success',
    Événement: 'warning',
    Témoignage: 'info',
    Projet: 'secondary',
    Certification: 'error',
    Communication: 'purple',
  }

  return colors[categorie] || 'default'
}

const getImageUrl = (actualite: Actualite) => {
  return actualite.image_url || `https://picsum.photos/400/250?random=${actualite.id}`
}

const resetForm = () => {
  formData.value = {
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
    utilisateur_id: 1,
  }
}

// Actions
const ouvrirCreateModal = () => {
  resetForm()
  showCreateModal.value = true
}

const voirActualite = (actualite: Actualite) => {
  selectedActualite.value = actualite
  showViewModal.value = true
}

const modifierActualite = (actualite: Actualite) => {
  selectedActualite.value = actualite
  formData.value = {
    titre: actualite.titre,
    slug: actualite.slug,
    categorie: actualite.categorie,
    chapeau: actualite.chapeau,
    contenu_html: actualite.contenu_html,
    image_url: actualite.image_url,
    date_publication: actualite.date_publication,
    date_debut_formation: actualite.date_debut_formation || '',
    date_fin_formation: actualite.date_fin_formation || '',
    document_url: actualite.document_url || '',
    auteur: actualite.auteur,
    utilisateur_id: actualite.utilisateur_id,
  }
  showEditModal.value = true
}

const supprimerActualite = (actualite: Actualite) => {
  selectedActualite.value = actualite
  showDeleteModal.value = true
}

// Génération automatique du slug
const onTitreChange = () => {
  if (formData.value.titre && !formData.value.slug)
    formData.value.slug = generateSlug(formData.value.titre)
}

// Upload d'image
const onImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    try {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        error.value = 'Veuillez sélectionner un fichier image valide'

        return
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        error.value = 'L\'image ne doit pas dépasser 5MB'

        return
      }

      const response = await uploadFile(file, 'image')

      // Utiliser l'URL complète retournée par l'API pour la base de données
      formData.value.image_url = response.url

      // Afficher un message de succès
      console.log('Image uploadée avec succès:', {
        filename: response.filename,
        original_filename: response.original_filename,
        url: response.url,
        size: response.size,
      })
    }
    catch (err) {
      console.error('Erreur upload image:', err)
      error.value = t('actualites.form.uploadError')
    }
  }
}

// Upload de document
const onDocumentUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    try {
      // Vérifier le type de fichier
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ]

      if (!allowedTypes.includes(file.type)) {
        error.value = 'Veuillez sélectionner un fichier PDF, DOC, DOCX, XLS ou XLSX'

        return
      }

      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        error.value = 'Le document ne doit pas dépasser 10MB'

        return
      }

      const response = await uploadFile(file, 'document')

      // Utiliser l'URL complète retournée par l'API pour la base de données
      formData.value.document_url = response.url

      // Afficher un message de succès
      console.log('Document uploadé avec succès:', {
        filename: response.filename,
        original_filename: response.original_filename,
        url: response.url,
        size: response.size,
      })
    }
    catch (err) {
      console.error('Erreur upload document:', err)
      error.value = t('actualites.form.uploadError')
    }
  }
}

// Fonction pour formater une date au format YYYY-MM-DD
const formatDateForAPI = (dateString: string): string => {
  if (!dateString)
    return ''

  const date = new Date(dateString)
  if (isNaN(date.getTime()))
    return ''

  return date.toISOString().split('T')[0]
}

// Soumission du formulaire
const submitForm = async () => {
  try {
    // Validation des champs obligatoires
    if (!formData.value.titre.trim()) {
      error.value = 'Le titre est obligatoire'

      return
    }
    if (!formData.value.categorie.trim()) {
      error.value = 'La catégorie est obligatoire'

      return
    }
    if (!formData.value.chapeau.trim()) {
      error.value = 'Le chapeau est obligatoire'

      return
    }
    if (!formData.value.contenu_html.trim()) {
      error.value = 'Le contenu est obligatoire'

      return
    }
    if (!formData.value.date_publication) {
      error.value = 'La date de publication est obligatoire'

      return
    }
    if (!formData.value.auteur.trim()) {
      error.value = 'L\'auteur est obligatoire'

      return
    }

    // Générer le slug automatiquement si pas fourni
    const slug = formData.value.slug.trim() || generateSlug(formData.value.titre)

    // Préparer les données avec les dates formatées
    const payload: any = {
      titre: formData.value.titre.trim(),
      slug,
      categorie: formData.value.categorie.trim(),
      chapeau: formData.value.chapeau.trim(),
      contenu_html: formData.value.contenu_html.trim(),
      date_publication: formatDateForAPI(formData.value.date_publication),
      auteur: formData.value.auteur.trim(),
      utilisateur_id: Number(authStore.userId) || 1, // S'assurer que c'est un nombre valide
    }

    // Ajouter les champs optionnels seulement s'ils ont une valeur
    if (formData.value.image_url && formData.value.image_url.trim())
      payload.image_url = formData.value.image_url.trim()

    if (formData.value.document_url && formData.value.document_url.trim())
      payload.document_url = formData.value.document_url.trim()

    // Pour les dates optionnelles, ne les inclure que si elles sont renseignées et valides
    if (formData.value.date_debut_formation && formData.value.date_debut_formation.trim()) {
      const formattedDate = formatDateForAPI(formData.value.date_debut_formation)
      if (formattedDate)
        payload.date_debut_formation = formattedDate
    }

    if (formData.value.date_fin_formation && formData.value.date_fin_formation.trim()) {
      const formattedDate = formatDateForAPI(formData.value.date_fin_formation)
      if (formattedDate)
        payload.date_fin_formation = formattedDate
    }

    console.log('Payload envoyé à l\'API:', payload)

    if (selectedActualite.value) {
      // Modification
      await updateActualite(selectedActualite.value.id!, payload)
      showEditModal.value = false
    }
    else {
      // Création
      await createActualite(payload)
      showCreateModal.value = false
    }

    // Recharger les données
    await fetchActualites(true, searchQuery.value, selectedCategorie.value)
  }
  catch (err: any) {
    console.error('Erreur soumission:', err)

    // Afficher les détails de l'erreur de validation
    if (err.status === 422 && err.errors) {
      console.log('Détails erreur 422:', err.errors)

      if (Array.isArray(err.errors)) {
        // Format FastAPI avec detail array
        const validationErrors = err.errors
          .map((error: any) => {
            const field = error.loc ? error.loc.join('.') : 'unknown'

            return `${field}: ${error.msg}`
          })
          .join('\n')

        error.value = `Erreur de validation:\n${validationErrors}`
      }
      else {
        // Format objet classique
        const validationErrors = Object.entries(err.errors)
          .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n')

        error.value = `Erreur de validation:\n${validationErrors}`
      }
    }
    else {
      error.value = err.message || 'Erreur lors de la soumission'
    }
  }
}

// Confirmation de suppression
const confirmerSuppression = async () => {
  if (selectedActualite.value?.id) {
    try {
      await deleteActualite(selectedActualite.value.id)
      showDeleteModal.value = false
      selectedActualite.value = null
    }
    catch (err) {
      console.error('Erreur suppression:', err)
    }
  }
}

// Chargement paresseux
const loadMoreActualites = async () => {
  if (hasMore.value && !loading.value)
    await loadMore(searchQuery.value, selectedCategorie.value)
}

// Recherche et filtrage
const onSearch = async () => {
  await fetchActualites(true, searchQuery.value, selectedCategorie.value)
}

const onCategorieChange = async () => {
  await fetchActualites(true, searchQuery.value, selectedCategorie.value)
}

// Fonction de test pour vérifier le format de l'API
const testAPIFormat = () => {
  const testPayload = {
    titre: 'Test Actualité',
    slug: 'test-actualite',
    categorie: 'Formation',
    chapeau: 'Ceci est un test',
    contenu_html: '<p>Contenu de test</p>',
    image_url: 'https://example.com/image.jpg',
    date_publication: '2025-08-11',
    date_debut_formation: '2025-08-15',
    date_fin_formation: '2025-08-20',
    document_url: 'https://example.com/document.pdf',
    auteur: 'Test Auteur',
    utilisateur_id: 1,
  }

  console.log('Format de test pour l\'API:', testPayload)
  console.log('JSON stringifié:', JSON.stringify(testPayload, null, 2))
}

// Lifecycle
onMounted(async () => {
  // Initialiser un utilisateur demo si pas connecté
  authStore.initDemoUser()

  await fetchActualites()

  // Afficher le format de test dans la console
  testAPIFormat()
})
</script>

<template>
  <div class="actualites-page">
    <!-- En-tête de la page -->
    <div class="page-header mb-6">
      <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center gap-4">
        <div class="page-header-text">
          <h1 class="text-h4 font-weight-bold text-high-emphasis mb-2">
            {{ t('actualites.title') }}
          </h1>
          <p class="text-body-1 text-medium-emphasis mb-0">
            {{ t('actualites.subtitle') }}
          </p>
        </div>

        <!-- Bouton Nouvelle actualité -->
        <div class="page-header-actions flex-shrink-0">
          <VBtn color="primary" prepend-icon="ri-add-line" variant="elevated" class="text-none"
            :class="{ 'w-100': $vuetify.display.xs }" @click="ouvrirCreateModal">
            <span class="d-none d-sm-inline">{{ t('actualites.newArticle') }}</span>
            <span class="d-sm-none">Nouveau</span>
          </VBtn>
        </div>
      </div>

      <!-- Filtres et recherche -->
      <VCard class="pa-4" variant="outlined">
        <VRow align="center" class="filters-row">
          <VCol cols="12" md="6">
            <VTextField v-model="searchQuery" :placeholder="t('actualites.search.placeholder')"
              prepend-inner-icon="ri-search-line" variant="outlined" density="compact" hide-details clearable
              @update:model-value="onSearch" />
          </VCol>
          <VCol cols="12" md="4">
            <VSelect v-model="selectedCategorie" :items="categories" :label="t('actualites.form.category')"
              variant="outlined" density="compact" hide-details @update:model-value="onCategorieChange" />
          </VCol>
          <VCol cols="12" md="2">
            <VBtnToggle v-model="viewMode" mandatory variant="outlined" density="compact">
              <VBtn value="grid" icon="ri-grid-line" />
              <VBtn value="list" icon="ri-list-unordered" />
            </VBtnToggle>
          </VCol>
        </VRow>
      </VCard>
    </div>

    <!-- Message d'erreur -->
    <VAlert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = null">
      {{ error }}
    </VAlert>

    <!-- Actualités à la une -->
    <div v-if="actualitesFeatured.length && !searchQuery.trim()" class="featured-section mb-8">
      <h2 class="text-h5 font-weight-bold mb-4 text-primary">
        <VIcon icon="ri-star-line" class="me-2" />
        {{ t('actualites.featured') }}
      </h2>

      <VRow>
        <VCol v-for="actualite in actualitesFeatured" :key="actualite.id" cols="12" md="6">
          <VCard class="featured-card h-100" variant="elevated" @click="voirActualite(actualite)">
            <div class="position-relative">
              <VImg :src="getImageUrl(actualite)" height="200" cover class="featured-image">
                <template #placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <VProgressCircular indeterminate color="primary" />
                  </div>
                </template>
              </VImg>

              <!-- Badge featured -->
              <VChip color="primary" size="small" class="featured-badge" prepend-icon="ri-star-fill">
                À la une
              </VChip>

              <!-- Badge catégorie -->
              <VChip :color="getCategorieColor(actualite.categorie)" size="small" class="category-badge">
                {{ actualite.categorie }}
              </VChip>

              <!-- Actions -->
              <div class="card-actions">
                <VBtn icon size="small" variant="elevated" color="primary" @click.stop="modifierActualite(actualite)">
                  <VIcon icon="ri-edit-line" />
                </VBtn>
                <VBtn icon size="small" variant="elevated" color="error" @click.stop="supprimerActualite(actualite)">
                  <VIcon icon="ri-delete-bin-line" />
                </VBtn>
              </div>
            </div>

            <VCardText class="pa-4">
              <div class="d-flex align-center mb-2">
                <VIcon icon="ri-calendar-line" size="16" class="me-1 text-disabled" />
                <span class="text-caption text-disabled me-3">{{ formatDate(actualite.date_publication) }}</span>
                <VIcon icon="ri-user-line" size="16" class="me-1 text-disabled" />
                <span class="text-caption text-disabled me-3">{{ actualite.auteur }}</span>
                <VIcon icon="ri-eye-line" size="16" class="me-1 text-disabled" />
                <span class="text-caption text-disabled">{{ actualite.vues || 0 }} vues</span>
              </div>

              <h3 class="text-h6 font-weight-bold mb-2 text-high-emphasis">
                {{ actualite.titre }}
              </h3>

              <p class="text-body-2 text-medium-emphasis mb-3">
                {{ actualite.chapeau }}
              </p>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <!-- Grille des actualités -->
    <div class="actualites-grid">
      <div class="d-flex justify-space-between align-center mb-4">
        <h2 class="text-h5 font-weight-bold text-high-emphasis">
          {{ searchQuery.trim() ? t('actualites.search.results') : t('actualites.allArticles') }}
          <VChip size="small" variant="outlined" class="ms-2">
            {{ actualitesFiltrees.length }}
          </VChip>
        </h2>
      </div>

      <!-- Vue grille -->
      <VRow v-if="viewMode === 'grid'">
        <VCol v-for="actualite in autresActualites" :key="actualite.id" cols="12" sm="6" lg="4" xl="3">
          <VCard class="actualite-card h-100" variant="outlined" hover @click="voirActualite(actualite)">
            <div class="position-relative">
              <VImg :src="getImageUrl(actualite)" height="180" cover class="card-image">
                <template #placeholder>
                  <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                    <VIcon icon="ri-image-line" size="48" class="text-disabled" />
                  </div>
                </template>
              </VImg>

              <!-- Badge catégorie -->
              <VChip :color="getCategorieColor(actualite.categorie)" size="small" class="category-badge-small">
                {{ actualite.categorie }}
              </VChip>

              <!-- Actions -->
              <div class="card-actions">
                <VBtn icon size="small" variant="elevated" color="primary" @click.stop="modifierActualite(actualite)">
                  <VIcon icon="ri-edit-line" />
                </VBtn>
                <VBtn icon size="small" variant="elevated" color="error" @click.stop="supprimerActualite(actualite)">
                  <VIcon icon="ri-delete-bin-line" />
                </VBtn>
              </div>
            </div>

            <VCardText class="pa-3">
              <div class="d-flex align-center mb-2">
                <VIcon icon="ri-calendar-line" size="14" class="me-1 text-disabled" />
                <span class="text-caption text-disabled">{{ formatDate(actualite.date_publication) }}</span>
                <VSpacer />
                <VIcon icon="ri-eye-line" size="14" class="me-1 text-disabled" />
                <span class="text-caption text-disabled">{{ actualite.vues || 0 }}</span>
              </div>

              <h4 class="text-subtitle-1 font-weight-bold mb-2 text-high-emphasis line-clamp-2">
                {{ actualite.titre }}
              </h4>

              <p class="text-body-2 text-medium-emphasis mb-3 line-clamp-3">
                {{ actualite.chapeau }}
              </p>
            </VCardText>

            <VCardActions class="pa-3 pt-0">
              <VBtn variant="text" color="primary" size="small" append-icon="ri-arrow-right-line" class="text-none">
                {{ t('actualites.readMore') }}
              </VBtn>
              <VSpacer />
              <VBtn icon variant="text" size="small" color="grey">
                <VIcon icon="ri-share-line" />
              </VBtn>
            </VCardActions>
          </VCard>
        </VCol>
      </VRow>

      <!-- Vue liste -->
      <div v-else class="list-view">
        <VCard v-for="actualite in autresActualites" :key="actualite.id" class="actualite-list-item mb-3"
          variant="outlined" hover @click="voirActualite(actualite)">
          <VCardText class="pa-4">
            <VRow align="center">
              <VCol cols="12" md="3">
                <div class="position-relative">
                  <VImg :src="getImageUrl(actualite)" height="120" cover class="rounded">
                    <template #placeholder>
                      <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                        <VIcon icon="ri-image-line" size="32" class="text-disabled" />
                      </div>
                    </template>
                  </VImg>

                  <!-- Actions pour vue liste -->
                  <div class="list-actions">
                    <VBtn icon size="small" variant="elevated" color="primary"
                      @click.stop="modifierActualite(actualite)">
                      <VIcon icon="ri-edit-line" />
                    </VBtn>
                    <VBtn icon size="small" variant="elevated" color="error"
                      @click.stop="supprimerActualite(actualite)">
                      <VIcon icon="ri-delete-bin-line" />
                    </VBtn>
                  </div>
                </div>
              </VCol>
              <VCol cols="12" md="9">
                <div class="d-flex align-center mb-2">
                  <VChip :color="getCategorieColor(actualite.categorie)" size="small" class="me-2">
                    {{ actualite.categorie }}
                  </VChip>
                  <VIcon icon="ri-calendar-line" size="14" class="me-1 text-disabled" />
                  <span class="text-caption text-disabled me-3">{{ formatDate(actualite.date_publication) }}</span>
                  <VIcon icon="ri-eye-line" size="14" class="me-1 text-disabled" />
                  <span class="text-caption text-disabled">{{ actualite.vues || 0 }} vues</span>
                </div>

                <h3 class="text-h6 font-weight-bold mb-2 text-high-emphasis">
                  {{ actualite.titre }}
                </h3>

                <p class="text-body-2 text-medium-emphasis mb-3">
                  {{ actualite.chapeau }}
                </p>

                <div class="d-flex align-center justify-space-between">
                  <span class="text-caption text-disabled">
                    Par {{ actualite.auteur }}
                  </span>

                  <VBtn variant="text" color="primary" size="small" append-icon="ri-arrow-right-line" class="text-none">
                    Lire la suite
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </div>

      <!-- Message si aucune actualité -->
      <div v-if="isEmpty" class="text-center py-12">
        <VIcon icon="ri-newspaper-line" size="64" class="text-disabled mb-4" />
        <h3 class="text-h6 text-disabled mb-2">
          {{ t('actualites.search.noResults') }}
        </h3>
        <p class="text-body-2 text-disabled">
          {{ searchQuery.trim() ? t('actualites.search.tryOtherKeywords') : t('actualites.search.noArticles') }}
        </p>
        <VBtn v-if="!searchQuery.trim()" color="primary" variant="elevated" class="mt-4" @click="ouvrirCreateModal">
          {{ t('actualites.createFirst') }}
        </VBtn>
      </div>

      <!-- Indicateur de chargement -->
      <div v-if="loading && actualites.length === 0" class="text-center py-12">
        <VProgressCircular indeterminate color="primary" size="64" class="mb-4" />
        <p class="text-body-1 text-disabled">
          {{ t('actualites.loading') }}
        </p>
      </div>
    </div>

    <!-- Modal Créer actualité -->
    <VDialog v-model="showCreateModal" max-width="1200" persistent scrollable class="actualite-modal">
      <VCard class="elevation-8">
        <VCardTitle class="d-flex align-center justify-space-between pa-6 bg-primary text-white">
          <div class="d-flex align-center">
            <VIcon icon="ri-add-line" class="me-3" size="24" />
            <span class="text-h5 font-weight-medium">{{ t('actualites.modal.create.title') }}</span>
          </div>
          <VBtn icon variant="text" color="white" @click="showCreateModal = false">
            <VIcon icon="ri-close-line" />
          </VBtn>
        </VCardTitle>

        <VCardText class="pa-6">
          <!-- Message d'erreur -->
          <VAlert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = null">
            {{ error }}
          </VAlert>

          <VForm @submit.prevent="submitForm">
            <VRow>
              <!-- Colonne gauche - Contenu principal -->
              <VCol cols="12" md="8">
                <div class="mb-6">
                  <h3 class="text-h6 font-weight-medium mb-4 text-primary">
                    <VIcon icon="ri-file-text-line" class="me-2" />
                    Informations principales
                  </h3>
                  <VTextField v-model="formData.titre" :label="`${t('actualites.form.title')} *`" variant="outlined"
                    :rules="[v => !!v || t('actualites.form.titleRequired')]" class="mb-4" @input="onTitreChange" />

                  <VTextField v-model="formData.slug" :label="`${t('actualites.form.slug')} *`" variant="outlined"
                    :hint="t('actualites.form.slugHint')" persistent-hint
                    :rules="[v => !!v || t('actualites.form.slugRequired')]" class="mb-4" />

                  <VTextarea v-model="formData.chapeau" :label="`${t('actualites.form.summary')} *`" variant="outlined"
                    rows="3" :hint="t('actualites.form.summaryHint')" persistent-hint
                    :rules="[v => !!v || t('actualites.form.summaryRequired')]" class="mb-4" />
                </div>

                <div class="mb-6">
                  <h3 class="text-h6 font-weight-medium mb-4 text-primary">
                    <VIcon icon="ri-edit-box-line" class="me-2" />
                    {{ t('actualites.form.content') }} *
                  </h3>
                  <RichTextEditor v-model="formData.contenu_html" :show-preview="true" />
                </div>
              </VCol>

              <!-- Colonne droite - Métadonnées -->
              <VCol cols="12" md="4">
                <div class="mb-6">
                  <h3 class="text-h6 font-weight-medium mb-4 text-primary">
                    <VIcon icon="ri-settings-3-line" class="me-2" />
                    Métadonnées
                  </h3>

                  <VSelect v-model="formData.categorie"
                    :items="categories.filter(c => c !== t('actualites.categories.all'))"
                    :label="`${t('actualites.form.category')} *`" variant="outlined"
                    :rules="[v => !!v || t('actualites.form.categoryRequired')]" class="mb-4" />

                  <VTextField v-model="formData.auteur" :label="`${t('actualites.form.author')} *`" variant="outlined"
                    :rules="[v => !!v || t('actualites.form.authorRequired')]" class="mb-4" />

                  <VTextField v-model="formData.date_publication" :label="`${t('actualites.form.publicationDate')} *`"
                    type="date" variant="outlined" :rules="[v => !!v || t('actualites.form.publicationDateRequired')]"
                    class="mb-4" />
                </div>

                <div class="mb-6">
                  <h3 class="text-h6 font-weight-medium mb-4 text-primary">
                    <VIcon icon="ri-calendar-line" class="me-2" />
                    Dates de formation ({{ t('actualites.form.optional') }})
                  </h3>

                  <VTextField v-model="formData.date_debut_formation" :label="t('actualites.form.trainingStartDate')"
                    type="date" variant="outlined" :hint="t('actualites.form.optional')" persistent-hint class="mb-4" />

                  <VTextField v-model="formData.date_fin_formation" :label="t('actualites.form.trainingEndDate')"
                    type="date" variant="outlined" :hint="t('actualites.form.optional')" persistent-hint class="mb-4" />
                </div>

                <div class="mb-6">
                  <h3 class="text-h6 font-weight-medium mb-4 text-primary">
                    <VIcon icon="ri-image-line" class="me-2" />
                    Médias
                  </h3>

                  <!-- Upload image -->
                  <div class="mb-6">
                    <VLabel class="text-subtitle-2 mb-3">
                      {{ t('actualites.form.mainImage') }}
                    </VLabel>
                    <VFileInput accept="image/*" variant="outlined" prepend-icon="ri-image-line"
                      :label="t('actualites.form.chooseImage')" :loading="uploading" class="mb-3"
                      @change="onImageUpload" />
                    <VImg v-if="formData.image_url" :src="formData.image_url" height="120" cover class="rounded" />
                  </div>

                  <!-- Upload document -->
                  <div class="mb-6">
                    <VLabel class="text-subtitle-2 mb-3">
                      {{ t('actualites.form.attachedDocument') }}
                    </VLabel>
                    <VFileInput accept=".pdf,.doc,.docx,.xls,.xlsx" variant="outlined" prepend-icon="ri-file-line"
                      :label="t('actualites.form.chooseDocument')" :loading="uploading" class="mb-3"
                      @change="onDocumentUpload" />
                    <VChip v-if="formData.document_url" color="primary" variant="outlined" prepend-icon="ri-file-line">
                      {{ t('actualites.form.documentAttached') }}
                    </VChip>
                  </div>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>

        <VDivider />

        <VCardActions class="pa-6 bg-grey-lighten-5">
          <VSpacer />
          <VBtn variant="outlined" color="grey" class="me-3" @click="showCreateModal = false">
            <VIcon icon="ri-close-line" class="me-2" />
            {{ t('actualites.actions.cancel') }}
          </VBtn>
          <VBtn color="primary" variant="elevated" :loading="creating" size="large" @click="submitForm">
            <VIcon icon="ri-save-line" class="me-2" />
            {{ t('actualites.actions.create') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Modal Modifier actualité -->
    <VDialog v-model="showEditModal" max-width="1200" persistent scrollable>
      <VCard>
        <VCardTitle class="d-flex align-center pa-4 pb-2">
          <VIcon icon="ri-edit-line" class="me-2" />
          Modifier l'actualité
        </VCardTitle>

        <VDivider />

        <VCardText class="pa-4">
          <VForm @submit.prevent="submitForm">
            <VRow>
              <!-- Colonne gauche -->
              <VCol cols="12" md="8">
                <VTextField v-model="formData.titre" label="Titre *" variant="outlined"
                  :rules="[v => !!v || 'Le titre est requis']" @input="onTitreChange" />

                <VTextField v-model="formData.slug" label="Slug *" variant="outlined" hint="URL de l'actualité"
                  persistent-hint :rules="[v => !!v || 'Le slug est requis']" />

                <VTextarea v-model="formData.chapeau" label="Chapeau *" variant="outlined" rows="3"
                  hint="Résumé court de l'actualité" persistent-hint :rules="[v => !!v || 'Le chapeau est requis']" />

                <div class="mb-4">
                  <VLabel class="text-subtitle-2 mb-2">
                    Contenu HTML *
                  </VLabel>
                  <RichTextEditor v-model="formData.contenu_html" :show-preview="true" />
                </div>
              </VCol>

              <!-- Colonne droite -->
              <VCol cols="12" md="4">
                <VSelect v-model="formData.categorie" :items="categories.filter(c => c !== 'Toutes')"
                  label="Catégorie *" variant="outlined" :rules="[v => !!v || 'La catégorie est requise']" />

                <VTextField v-model="formData.auteur" label="Auteur *" variant="outlined"
                  :rules="[v => !!v || 'L\'auteur est requis']" />

                <VTextField v-model="formData.date_publication" label="Date de publication *" type="date"
                  variant="outlined" :rules="[v => !!v || 'La date est requise']" />

                <VTextField v-model="formData.date_debut_formation" label="Date début formation" type="date"
                  variant="outlined" hint="Optionnel" persistent-hint />

                <VTextField v-model="formData.date_fin_formation" label="Date fin formation" type="date"
                  variant="outlined" hint="Optionnel" persistent-hint />

                <!-- Upload image -->
                <div class="mb-4">
                  <VLabel class="text-subtitle-2 mb-2">
                    Image principale
                  </VLabel>
                  <VFileInput accept="image/*" variant="outlined" prepend-icon="ri-image-line" label="Choisir une image"
                    :loading="uploading" @change="onImageUpload" />
                  <VImg v-if="formData.image_url" :src="formData.image_url" height="120" cover class="rounded mt-2" />
                </div>

                <!-- Upload document -->
                <div class="mb-4">
                  <VLabel class="text-subtitle-2 mb-2">
                    Document joint
                  </VLabel>
                  <VFileInput accept=".pdf,.doc,.docx,.xls,.xlsx" variant="outlined" prepend-icon="ri-file-line"
                    label="Choisir un document" :loading="uploading" @change="onDocumentUpload" />
                  <VChip v-if="formData.document_url" color="primary" variant="outlined" class="mt-2"
                    prepend-icon="ri-file-line">
                    Document joint
                  </VChip>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>

        <VDivider />

        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="showEditModal = false">
            Annuler
          </VBtn>
          <VBtn color="primary" variant="elevated" :loading="updating" @click="submitForm">
            Sauvegarder
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Modal Visualiser actualité -->
    <VDialog v-model="showViewModal" max-width="900" scrollable>
      <VCard v-if="selectedActualite">
        <div class="position-relative">
          <VImg v-if="selectedActualite.image_url" :src="selectedActualite.image_url" height="300" cover />

          <!-- Actions dans l'en-tête -->
          <div class="view-actions">
            <VBtn icon variant="elevated" color="primary" @click="modifierActualite(selectedActualite)">
              <VIcon icon="ri-edit-line" />
            </VBtn>
            <VBtn icon variant="elevated" color="error" @click="supprimerActualite(selectedActualite)">
              <VIcon icon="ri-delete-bin-line" />
            </VBtn>
            <VBtn icon variant="elevated" @click="showViewModal = false">
              <VIcon icon="ri-close-line" />
            </VBtn>
          </div>
        </div>

        <VCardText class="pa-6">
          <!-- Métadonnées -->
          <div class="d-flex align-center mb-4">
            <VChip :color="getCategorieColor(selectedActualite.categorie)" class="me-2">
              {{ selectedActualite.categorie }}
            </VChip>
            <VIcon icon="ri-calendar-line" size="16" class="me-1 text-disabled" />
            <span class="text-body-2 text-disabled me-4">{{ formatDate(selectedActualite.date_publication) }}</span>
            <VIcon icon="ri-user-line" size="16" class="me-1 text-disabled" />
            <span class="text-body-2 text-disabled me-4">{{ selectedActualite.auteur }}</span>
            <VIcon icon="ri-eye-line" size="16" class="me-1 text-disabled" />
            <span class="text-body-2 text-disabled">{{ selectedActualite.vues || 0 }} vues</span>
          </div>

          <!-- Titre -->
          <h1 class="text-h4 font-weight-bold mb-4 text-high-emphasis">
            {{ selectedActualite.titre }}
          </h1>

          <!-- Chapeau -->
          <div class="chapeau-section mb-6">
            <p class="text-h6 text-medium-emphasis font-weight-medium">
              {{ selectedActualite.chapeau }}
            </p>
          </div>

          <!-- Contenu HTML -->
          <div class="contenu-section">
            <div class="article-content" v-html="selectedActualite.contenu_html" />
          </div>

          <!-- Document joint -->
          <div v-if="selectedActualite.document_url" class="document-section mt-6">
            <VDivider class="mb-4" />
            <h3 class="text-h6 font-weight-bold mb-3">
              Document joint
            </h3>
            <VBtn :href="selectedActualite.document_url" target="_blank" color="primary" variant="outlined"
              prepend-icon="ri-download-line">
              Télécharger le document
            </VBtn>
          </div>

          <!-- Dates de formation -->
          <div v-if="selectedActualite.date_debut_formation || selectedActualite.date_fin_formation"
            class="formation-dates mt-6">
            <VDivider class="mb-4" />
            <h3 class="text-h6 font-weight-bold mb-3">
              Dates de formation
            </h3>
            <div class="d-flex gap-4">
              <div v-if="selectedActualite.date_debut_formation">
                <VIcon icon="ri-calendar-event-line" class="me-1" />
                <strong>Début :</strong> {{ formatDate(selectedActualite.date_debut_formation) }}
              </div>
              <div v-if="selectedActualite.date_fin_formation">
                <VIcon icon="ri-calendar-check-line" class="me-1" />
                <strong>Fin :</strong> {{ formatDate(selectedActualite.date_fin_formation) }}
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Modal Supprimer actualité -->
    <VDialog v-model="showDeleteModal" max-width="500">
      <VCard>
        <VCardTitle class="d-flex align-center pa-4 pb-2">
          <VIcon icon="ri-delete-bin-line" color="error" class="me-2" />
          Supprimer l'actualité
        </VCardTitle>

        <VDivider />

        <VCardText class="pa-4">
          <p class="text-body-1 mb-4">
            Êtes-vous sûr de vouloir supprimer cette actualité ?
          </p>

          <VCard v-if="selectedActualite" variant="outlined" class="pa-3">
            <div class="d-flex align-center">
              <VImg :src="getImageUrl(selectedActualite)" width="60" height="60" cover class="rounded me-3" />
              <div>
                <h4 class="text-subtitle-1 font-weight-bold">
                  {{ selectedActualite.titre }}
                </h4>
                <p class="text-body-2 text-disabled mb-0">
                  {{ selectedActualite.categorie }} • {{ formatDate(selectedActualite.date_publication) }}
                </p>
              </div>
            </div>
          </VCard>

          <VAlert type="warning" variant="tonal" class="mt-4">
            Cette action est irréversible.
          </VAlert>
        </VCardText>

        <VDivider />

        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="showDeleteModal = false">
            Annuler
          </VBtn>
          <VBtn color="error" variant="elevated" :loading="deleting" @click="confirmerSuppression">
            Supprimer
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.actualites-page {
  padding: 24px;
}

/* Modal styles */
.actualite-modal :deep(.v-dialog) {
  overflow: hidden;
  border-radius: 12px;
}

.actualite-modal :deep(.v-card-title) {
  border-radius: 0;
}

.actualite-modal :deep(.v-form) {
  gap: 0;
}

.actualite-modal :deep(.v-text-field),
.actualite-modal :deep(.v-textarea),
.actualite-modal :deep(.v-select),
.actualite-modal :deep(.v-file-input) {
  margin-block-end: 0;
}

.actualite-modal :deep(.v-input__details) {
  margin-block: 4px 8px;
}

.page-header {
  margin-block-end: 32px;
}

/* Cartes featured */
.featured-card {
  overflow: hidden;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.featured-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 15%);
  transform: translateY(-4px);
}

.featured-image {
  border-radius: 16px 16px 0 0;
}

.featured-badge {
  position: absolute;
  z-index: 2;
  inset-block-start: 12px;
  inset-inline-start: 12px;
}

.category-badge {
  position: absolute;
  z-index: 2;
  inset-block-start: 12px;
  inset-inline-end: 12px;
}

/* Actions sur les cartes */
.card-actions {
  position: absolute;
  display: flex;
  gap: 8px;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  opacity: 0;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s ease;
}

.featured-card:hover .card-actions,
.actualite-card:hover .card-actions {
  opacity: 1;
}

.list-actions {
  position: absolute;
  display: flex;
  gap: 4px;
  inset-block-start: 8px;
  inset-inline-end: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.actualite-list-item:hover .list-actions {
  opacity: 1;
}

/* Cartes normales */
.actualite-card {
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.actualite-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 10%);
  transform: translateY(-2px);
}

.card-image {
  border-radius: 12px 12px 0 0;
}

.category-badge-small {
  position: absolute;
  z-index: 2;
  inset-block-start: 8px;
  inset-inline-end: 8px;
}

/* Vue liste */
.actualite-list-item {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.actualite-list-item:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 10%);
  transform: translateX(4px);
}

/* Modal de visualisation */
.view-actions {
  position: absolute;
  z-index: 3;
  display: flex;
  gap: 8px;
  inset-block-start: 16px;
  inset-inline-end: 16px;
}

.chapeau-section {
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  border-inline-start: 4px solid rgb(var(--v-theme-primary));
}

.contenu-section {
  line-height: 1.7;
}

/* Styles pour le contenu HTML */
.article-content {
  line-height: 1.7;
}

.article-content h1,
.article-content h2,
.article-content h3,
.article-content h4,
.article-content h5,
.article-content h6 {
  color: rgb(var(--v-theme-primary));
  font-weight: bold;
  margin-block: 1.5rem 1rem;
  margin-inline: 0;
}

.article-content h1 {
  font-size: 2rem;
}

.article-content h2 {
  font-size: 1.5rem;
}

.article-content h3 {
  font-size: 1.25rem;
}

.article-content h4 {
  font-size: 1.1rem;
}

.article-content p {
  margin-block: 1rem;
  margin-inline: 0;
}

.article-content ul,
.article-content ol {
  margin-block: 1rem;
  margin-inline: 0;
  padding-inline-start: 2rem;
}

.article-content img {
  border-radius: 8px;
  block-size: auto;
  margin-block: 1rem;
  margin-inline: 0;
  max-inline-size: 100%;
}

.article-content a {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
}

.article-content blockquote {
  padding: 1rem;
  border-radius: 0 8px 8px 0;
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  border-inline-start: 4px solid rgb(var(--v-theme-primary));
  font-style: italic;
  margin-block: 1rem;
  margin-inline: 0;
  padding-inline-start: 1rem;
}

/* Utilitaires */
.line-clamp-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.line-clamp-3 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}

/* Responsive */
@media (max-width: 960px) {
  .actualites-page {
    padding: 16px;
  }

  .featured-card,
  .actualite-card {
    margin-block-end: 16px;
  }

  .card-actions {
    opacity: 1;

    /* Toujours visible sur mobile */
  }

  .list-actions {
    opacity: 1;

    /* Toujours visible sur mobile */
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .page-header-actions {
    inline-size: 100%;
  }

  .page-header-actions .v-btn {
    justify-content: center;
    inline-size: 100%;
  }
}

@media (max-width: 600px) {
  .actualites-page {
    padding: 12px;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .page-header p {
    font-size: 0.875rem;
  }

  /* Filtres en colonne sur mobile */
  .filters-row {
    flex-direction: column;
    gap: 12px;
  }

  .filters-row .v-text-field,
  .filters-row .v-select {
    inline-size: 100%;
  }

  /* Grille responsive */
  .actualites-grid {
    gap: 16px;
    grid-template-columns: 1fr;
  }

  /* Cartes plus compactes sur mobile */
  .actualite-card {
    margin-block-end: 16px;
  }

  .actualite-card .v-card-title {
    font-size: 1.1rem;
    line-height: 1.3;
  }

  .actualite-card .v-card-text {
    padding: 12px;
  }

  /* Modal plein écran sur mobile */
  .actualite-modal .v-dialog {
    border-radius: 0;
    margin: 0;
    max-block-size: 100vh;
  }

  .actualite-modal .v-card {
    border-radius: 0;
    max-block-size: 100vh;
    overflow-y: auto;
  }
}

/* Animation d'apparition */
.featured-card,
.actualite-card,
.actualite-list-item {
  animation: fade-in-up 0.5s ease-out;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Styles pour les badges */
.v-chip.v-chip--size-small {
  block-size: 24px;
  font-size: 0.75rem;
}

.v-chip.v-chip--size-x-small {
  block-size: 20px;
  font-size: 0.625rem;
}
</style>
