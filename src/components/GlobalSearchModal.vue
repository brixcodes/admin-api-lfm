<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

// États
const isOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement>()

// Pages et fonctionnalités de l'application
const appData = [
  // Navigation principale
  {
    title: 'Dashboard',
    description: 'Tableau de bord principal avec statistiques',
    path: '/dashboard',
    icon: 'ri-dashboard-line',
    category: 'navigation',
    keywords: ['tableau', 'bord', 'statistiques', 'accueil', 'home']
  },
  {
    title: 'Utilisateurs',
    description: 'Gestion des utilisateurs et apprenants auxiliaires de vie',
    path: '/system',
    icon: 'ri-user-line',
    category: 'system',
    keywords: ['users', 'apprenants', 'auxiliaires', 'vie', 'étudiants', 'personnes']
  },
  {
    title: 'Formations',
    description: 'Parcours de formation auxiliaire de vie en univers carcéral',
    path: '/formations',
    icon: 'ri-graduation-cap-line',
    category: 'education',
    keywords: ['cours', 'modules', 'apprentissage', 'carcéral', 'pénitencier', 'lafaom']
  },
  {
    title: 'Gestion',
    description: 'Inscriptions et paiements des formations',
    path: '/gestion',
    icon: 'ri-file-list-line',
    category: 'management',
    keywords: ['inscriptions', 'paiements', 'finances', 'administration']
  },
  {
    title: 'Projets',
    description: 'Projets collectifs et chefs d\'œuvre',
    path: '/projets',
    icon: 'ri-folder-line',
    category: 'projects',
    keywords: ['collectifs', 'chefs', 'œuvre', 'collaboration', 'équipe']
  },
  {
    title: 'Informations',
    description: 'Accréditations et actualités de l\'institut',
    path: '/infos',
    icon: 'ri-information-line',
    category: 'info',
    keywords: ['accréditations', 'actualités', 'news', 'certifications', 'institut']
  },
  {
    title: 'Fichiers',
    description: 'Gestion des documents et ressources',
    path: '/fichiers',
    icon: 'ri-file-line',
    category: 'files',
    keywords: ['documents', 'ressources', 'téléchargements', 'uploads', 'médias']
  },
  {
    title: 'Profil',
    description: 'Paramètres du compte utilisateur',
    path: '/profil',
    icon: 'ri-user-settings-line',
    category: 'account',
    keywords: ['compte', 'paramètres', 'settings', 'personnel', 'configuration']
  },

  // Spécialités
  {
    title: 'Technicien d\'assistance',
    description: 'Spécialité construction réseau-parrain et redevabilité',
    path: '/formations',
    icon: 'ri-tools-line',
    category: 'specialty',
    keywords: ['réseau', 'parrain', 'redevabilité', 'technique', 'assistance', 'financier']
  },
  {
    title: 'Appui services pénitentiaires',
    description: 'Facilitation accès services insertion et probation',
    path: '/formations',
    icon: 'ri-building-line',
    category: 'specialty',
    keywords: ['pénitentiaires', 'insertion', 'probation', 'services', 'prison', 'détention']
  },
  {
    title: 'Accueil, écoute et accompagnement',
    description: 'Maintien socialité et accompagnement psycho-social',
    path: '/formations',
    icon: 'ri-heart-line',
    category: 'specialty',
    keywords: ['accueil', 'écoute', 'accompagnement', 'socialité', 'psycho', 'social']
  },

  // Fonctionnalités système
  {
    title: 'Rôles et permissions',
    description: 'Gestion des droits d\'accès',
    path: '/system',
    icon: 'ri-shield-user-line',
    category: 'system',
    keywords: ['rôles', 'permissions', 'droits', 'accès', 'sécurité', 'admin']
  },
  {
    title: 'Modules de formation',
    description: 'Contenu pédagogique des formations',
    path: '/formations',
    icon: 'ri-book-line',
    category: 'education',
    keywords: ['modules', 'contenu', 'pédagogique', 'leçons', 'cours']
  },
  {
    title: 'Évaluations',
    description: 'Tests et examens des apprenants',
    path: '/formations',
    icon: 'ri-file-text-line',
    category: 'education',
    keywords: ['évaluations', 'tests', 'examens', 'quiz', 'notes']
  }
]

// Recherches populaires
const popularSearches = [
  { title: 'Utilisateurs', query: 'utilisateurs', icon: 'ri-user-line' },
  { title: 'Formations', query: 'formations', icon: 'ri-graduation-cap-line' },
  { title: 'Spécialités', query: 'spécialités', icon: 'ri-award-line' },
  { title: 'Projets collectifs', query: 'projets', icon: 'ri-team-line' },
  { title: 'Technicien assistance', query: 'technicien', icon: 'ri-tools-line' },
  { title: 'Services pénitentiaires', query: 'pénitentiaires', icon: 'ri-building-line' }
]

// Catégories d'applications
const appCategories = computed(() => [
  {
    title: 'RECHERCHES POPULAIRES',
    items: popularSearches.slice(0, 4)
  },
  {
    title: 'APPS & PAGES',
    items: [
      { title: 'Calendrier', icon: 'ri-calendar-line', path: '/dashboard' },
      { title: 'Rôles & Permissions', icon: 'ri-shield-user-line', path: '/system' },
      { title: 'Paramètres compte', icon: 'ri-settings-line', path: '/profil' },
      { title: 'Exemples de dialogue', icon: 'ri-chat-3-line', path: '/formations' }
    ]
  },
  {
    title: 'INTERFACE UTILISATEUR',
    items: [
      { title: 'Typographie', icon: 'ri-text', path: '/formations' },
      { title: 'Accordéon', icon: 'ri-list-unordered', path: '/formations' },
      { title: 'Alertes', icon: 'ri-alert-line', path: '/formations' },
      { title: 'Cartes', icon: 'ri-layout-grid-line', path: '/formations' }
    ]
  },
  {
    title: 'RADIO & TABLES',
    items: [
      { title: 'Radio', icon: 'ri-radio-button-line', path: '/formations' },
      { title: 'Mise en page formulaire', icon: 'ri-layout-line', path: '/formations' },
      { title: 'Table', icon: 'ri-table-line', path: '/system' },
      { title: 'Éditeur', icon: 'ri-edit-line', path: '/formations' }
    ]
  }
])

// Résultats filtrés
const filteredResults = computed(() => {
  if (!searchQuery.value.trim()) return []

  const query = searchQuery.value.toLowerCase()

  return appData.filter(item => {
    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(query))
    )
  }).slice(0, 8) // Limiter à 8 résultats
})

// Fonction de recherche rapide
const performQuickSearch = (query: string) => {
  searchQuery.value = query
}

// Navigation vers un résultat
const navigateToResult = (path: string) => {
  router.push(path)
  closeSearch()
}

// Ouvrir/fermer la recherche
const openSearch = async () => {
  isOpen.value = true
  await nextTick()
  searchInput.value?.focus()
}

const closeSearch = () => {
  isOpen.value = false
  searchQuery.value = ''
}

// Raccourci clavier Cmd+K / Ctrl+K
const handleKeydown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    openSearch()
  }
  if (event.key === 'Escape' && isOpen.value) {
    closeSearch()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Exposer la fonction d'ouverture
defineExpose({
  openSearch
})
</script>

<template>
  <!-- Modal de recherche -->
  <VDialog v-model="isOpen" max-width="700" persistent class="global-search-dialog">
    <VCard class="global-search-card">
      <!-- En-tête avec champ de recherche -->
      <div class="search-header pa-4">
        <div class="d-flex align-center">
          <VIcon icon="ri-search-line" class="me-3 text-disabled" size="20" />
          <VTextField ref="searchInput" v-model="searchQuery" placeholder="Rechercher..." variant="plain" hide-details
            class="search-input" autofocus />
          <div class="d-flex align-center gap-2 ms-3">
            <VChip size="x-small" variant="outlined" class="text-caption">[esc]</VChip>
            <VBtn icon variant="text" size="small" @click="closeSearch">
              <VIcon icon="ri-close-line" />
            </VBtn>
          </div>
        </div>
      </div>

      <VDivider />

      <!-- Contenu de la recherche -->
      <div class="search-content" style="max-block-size: 500px; overflow-y: auto;">
        <!-- Résultats de recherche -->
        <div v-if="searchQuery.trim() && filteredResults.length" class="pa-4">
          <div class="search-results">
            <div v-for="result in filteredResults" :key="result.path + result.title"
              class="search-result-item pa-3 rounded cursor-pointer d-flex align-center"
              @click="navigateToResult(result.path)">
              <VIcon :icon="result.icon" class="me-3 text-primary" size="20" />
              <div class="flex-grow-1">
                <div class="font-weight-medium text-high-emphasis">{{ result.title }}</div>
                <div class="text-caption text-disabled">{{ result.description }}</div>
              </div>
              <VIcon icon="ri-corner-down-left-line" class="text-disabled" size="16" />
            </div>
          </div>
        </div>

        <!-- Aucun résultat -->
        <div v-else-if="searchQuery.trim() && !filteredResults.length" class="pa-6 text-center">
          <VIcon icon="ri-search-line" size="48" class="text-disabled mb-3" />
          <p class="text-disabled mb-0">Aucun résultat trouvé</p>
          <p class="text-caption text-disabled">Essayez avec d'autres mots-clés</p>
        </div>

        <!-- État initial (pas de recherche) -->
        <div v-else class="pa-4">
          <!-- Sections par catégorie -->
          <VRow>
            <VCol v-for="category in appCategories" :key="category.title" cols="12" md="6">
              <div class="mb-4">
                <h6 class="text-overline text-disabled mb-3 font-weight-medium">{{ category.title }}</h6>
                <div class="search-results">
                  <div v-for="item in category.items" :key="item.title"
                    class="search-result-item pa-2 rounded cursor-pointer d-flex align-center"
                    @click="'path' in item ? navigateToResult((item as any).path) : performQuickSearch((item as any).query || item.title)">
                    <VIcon :icon="item.icon" class="me-3" size="18" />
                    <span class="text-sm">{{ item.title }}</span>
                  </div>
                </div>
              </div>
            </VCol>
          </VRow>
        </div>
      </div>
    </VCard>
  </VDialog>
</template>

<style scoped>
.global-search-dialog :deep(.v-overlay__content) {
  margin-block: 8vh auto;
}

.global-search-card {
  border-radius: 12px;
  backdrop-filter: blur(20px);
  background: rgba(var(--v-theme-surface), 0.95);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 10%), 0 10px 10px -5px rgba(0, 0, 0, 4%);
}

.search-header {
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-surface), 0.8);
  border-block-end: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.search-input :deep(.v-field__input) {
  padding: 0;
  font-size: 1.1rem;
  min-block-size: auto;
}

.search-input :deep(.v-field__input input) {
  padding: 0;
}

.search-result-item {
  border: 1px solid transparent;
  min-block-size: 44px;
  transition: all 0.2s ease;
}

.search-result-item:hover {
  border-color: rgba(var(--v-theme-primary), 0.2);
  background: rgba(var(--v-theme-primary), 0.08);
  transform: translateY(-1px);
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.text-overline {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.0892857143em;
  line-height: 2.5;
  text-transform: uppercase;
}
</style>
