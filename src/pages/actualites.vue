<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { Actualite, CreateActualitePayload } from '@/composables/useActualites'
import ActualiteCreateDialog from '@/components/actualites/ActualiteCreateDialog.vue'
import ActualiteDetailsDialog from '@/components/actualites/ActualiteDetailsDialog.vue'
import ActualiteEditDialog from '@/components/actualites/ActualiteEditDialog.vue'
import ActualiteDeleteDialog from '@/components/actualites/ActualiteDeleteDialog.vue'

import { useActualites } from '@/composables/useActualites'

import { useAuthStore } from '@/stores/auth'

// Traduction
const { t } = useI18n()

// Store auth pour l'utilisateur connecté
const authStore = useAuthStore()

// Notifications (comme dans la page utilisateur)
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error' | 'warning' | 'info'>('success')

// Composable avec API réelle
const {
  actualites,
  loading,
  error,
  hasMore,
  isEmpty,

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

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(12)
const totalPages = computed(() => Math.ceil(actualitesFiltrees.value.length / itemsPerPage.value))

// Modals
const showCreateDialog = ref(false)
const showDetailsDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)

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

// Actualités paginées (remplace autresActualites)
const actualitesPaginees = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value

  return actualitesFiltrees.value.slice(start, end)
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

// Actions
const ouvrirCreateModal = () => {
  showCreateDialog.value = true
}

// Réinitialiser la pagination quand les filtres changent
const resetPagination = () => {
  currentPage.value = 1
}

// Watchers pour réinitialiser la pagination
watch([searchQuery, selectedCategorie], () => {
  resetPagination()
})

const voirActualite = (actualite: Actualite) => {
  selectedActualite.value = actualite
  showDetailsDialog.value = true
}

// Gestion de la création d'actualité
const onActualiteCreated = async (payload: CreateActualitePayload) => {
  try {
    await createActualite(payload)

    // Notification de succès
    notificationMessage.value = `Actualité "${payload.titre}" créée avec succès`
    notificationType.value = 'success'
    showNotification.value = true

    // Recharger les données
    await fetchActualites(true)
  }
  catch (err: any) {
    console.error('Erreur lors de la création:', err)
    notificationMessage.value = err.message || 'Erreur lors de la création de l\'actualité'
    notificationType.value = 'error'
    showNotification.value = true
  }
}

const modifierActualite = (actualite: Actualite) => {
  selectedActualite.value = actualite
  showEditDialog.value = true
}

// Gestion de la modification d'actualité
const onActualiteUpdated = async (payload: CreateActualitePayload) => {
  try {
    if (selectedActualite.value?.id) {
      await updateActualite(selectedActualite.value.id, payload)

      // Notification de succès
      notificationMessage.value = `Actualité "${payload.titre}" modifiée avec succès`
      notificationType.value = 'success'
      showNotification.value = true

      // Recharger les données
      await fetchActualites(true)
    }
  }
  catch (err: any) {
    console.error('Erreur lors de la modification:', err)
    notificationMessage.value = err.message || 'Erreur lors de la modification de l\'actualité'
    notificationType.value = 'error'
    showNotification.value = true
  }
}

const supprimerActualite = (actualite: Actualite) => {
  selectedActualite.value = actualite
  showDeleteDialog.value = true
}

// Gestion de la suppression d'actualité
const onActualiteDeleted = async (actualite: Actualite) => {
  try {
    await deleteActualite(actualite.id!)

    // Notification de succès
    notificationMessage.value = `Actualité "${actualite.titre}" supprimée avec succès`
    notificationType.value = 'success'
    showNotification.value = true

    // Recharger les données
    await fetchActualites(true)
  }
  catch (err: any) {
    console.error('Erreur lors de la suppression:', err)
    notificationMessage.value = err.message || 'Erreur lors de la suppression de l\'actualité'
    notificationType.value = 'error'
    showNotification.value = true
  }
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

      // Modification maintenant gérée par onActualiteUpdated
    }
    else {
      // Création - maintenant géré par onActualiteCreated
      // await createActualite(payload)
      // showCreateDialog.value = false
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

      // Suppression maintenant gérée par onActualiteDeleted
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
        <div class="page-header-actions flex-shrink-0 mb-3 ">
          <VBtn color="primary " prepend-icon="ri-add-line" variant="elevated" class="text-none"
            :class="{ 'w-100': $vuetify.display.xs }" @click="ouvrirCreateModal">
            <span class="d-none d-sm-inline">{{ t('actualites.newArticle') }}</span>
            <span class="d-sm-none ">{{ t('actualites.newArticle') }}</span>
          </VBtn>
        </div>
      </div>

      <!-- Filtres et recherche -->
      <VCard class="pa-4" variant="elevated">
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
        <VCol v-for="actualite in actualitesPaginees" :key="actualite.id" cols="12" sm="6" lg="4" xl="3">
          <VCard class="actualite-card h-100" variant="elevated" hover @click="voirActualite(actualite)">
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
        <VCard v-for="actualite in actualitesPaginees" :key="actualite.id" class="actualite-list-item mb-3"
          variant="elevated" hover @click="voirActualite(actualite)">
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
                    {{ t('actualites.readMore') }}
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

      <!-- Pagination -->
      <div v-if="actualitesFiltrees.length > itemsPerPage" class="d-flex justify-center mt-8">
        <VPagination v-model="currentPage" :length="totalPages" :total-visible="7" color="primary" variant="elevated"
          rounded="circle" />
      </div>

      <!-- Debug info (à supprimer en production) -->
      <div v-if="actualitesFiltrees.length > 0" class="text-center mt-4 text-caption text-disabled">
        Page {{ currentPage }} sur {{ totalPages }} | {{ actualitesFiltrees.length }} actualités au total | {{
          itemsPerPage }}
        par page
      </div>
    </div>

    <!-- Nouveaux composants de dialog -->
    <ActualiteCreateDialog v-model="showCreateDialog" @created="onActualiteCreated" />

    <ActualiteDetailsDialog v-model="showDetailsDialog" :actualite="selectedActualite"
      @edit-actualite="modifierActualite" @delete-actualite="supprimerActualite" />

    <ActualiteEditDialog v-model="showEditDialog" :actualite="selectedActualite" @updated="onActualiteUpdated" />

    <ActualiteDeleteDialog v-model="showDeleteDialog" :actualite="selectedActualite" @deleted="onActualiteDeleted" />

    <!-- Notification -->
    <VSnackbar v-model="showNotification" :color="notificationType" location="top right" timeout="4000">
      {{ notificationMessage }}
      <template #actions>
        <VBtn icon="ri-close-line" @click="showNotification = false" />
      </template>
    </VSnackbar>
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
