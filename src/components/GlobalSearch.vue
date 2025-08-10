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

// Données statiques pour la recherche (simulées)
const staticData = {
  // Pages de l'application
  pages: [
    {
      title: 'Dashboard',
      description: 'Tableau de bord principal',
      path: '/dashboard',
      icon: 'ri-dashboard-line',
      category: 'navigation',
      keywords: ['tableau', 'bord', 'accueil', 'dashboard', 'home']
    },
    {
      title: 'Utilisateurs',
      description: 'Gestion des utilisateurs et apprenants auxiliaires de vie',
      path: '/system',
      icon: 'ri-user-line',
      category: 'system',
      keywords: ['utilisateurs', 'users', 'apprenants', 'auxiliaires', 'vie', 'gestion', 'système']
    },
    {
      title: 'Formations',
      description: 'Gestion des formations auxiliaire de vie en univers carcéral',
      path: '/formations',
      icon: 'ri-graduation-cap-line',
      category: 'education',
      keywords: ['formations', 'training', 'éducation', 'parcours', 'auxiliaire', 'carcéral', 'lafaom']
    },
    {
      title: 'Gestion',
      description: 'Inscriptions et paiements des formations',
      path: '/gestion',
      icon: 'ri-file-list-line',
      category: 'management',
      keywords: ['gestion', 'inscriptions', 'paiements', 'management', 'administration']
    },
    {
      title: 'Projets',
      description: 'Projets collectifs et chefs d\'œuvre',
      path: '/projets',
      icon: 'ri-folder-line',
      category: 'projects',
      keywords: ['projets', 'collectifs', 'chefs', 'œuvre', 'masterpiece', 'collaboration']
    },
    {
      title: 'Informations',
      description: 'Accréditations et actualités de l\'institut',
      path: '/infos',
      icon: 'ri-information-line',
      category: 'info',
      keywords: ['informations', 'accréditations', 'actualités', 'news', 'institut', 'lafaom']
    },
    {
      title: 'Fichiers',
      description: 'Gestion des fichiers et documents',
      path: '/fichiers',
      icon: 'ri-file-line',
      category: 'files',
      keywords: ['fichiers', 'documents', 'files', 'upload', 'téléchargement']
    },
    {
      title: 'Profil',
      description: 'Paramètres du compte utilisateur',
      path: '/profil',
      icon: 'ri-user-settings-line',
      category: 'account',
      keywords: ['profil', 'compte', 'paramètres', 'settings', 'account']
    }
  ],

  // Spécialités de formation
  specialties: [
    {
      title: 'Technicien d\'assistance',
      description: 'Construction et viabilisation du réseau-parrain, gestion de la redevabilité',
      path: '/formations',
      icon: 'ri-tools-line',
      category: 'specialty',
      keywords: ['technicien', 'assistance', 'réseau', 'parrain', 'redevabilité', 'financière']
    },
    {
      title: 'Appui aux services pénitentiaires',
      description: 'Facilitation de l\'accès aux services d\'insertion et de probation',
      path: '/formations',
      icon: 'ri-building-line',
      category: 'specialty',
      keywords: ['appui', 'services', 'pénitentiaires', 'insertion', 'probation', 'carcéral']
    },
    {
      title: 'Accueil, écoute et accompagnement',
      description: 'Maintien de la socialité et accompagnement psycho-social',
      path: '/formations',
      icon: 'ri-heart-line',
      category: 'specialty',
      keywords: ['accueil', 'écoute', 'accompagnement', 'socialité', 'psycho', 'social']
    }
  ],

  // Utilisateurs simulés
  users: [
    {
      id: 1,
      nom: 'Diallo',
      prenom: 'Amadou',
      email: 'amadou.diallo@lafaom.org',
      role: 'Apprenant auxiliaire de vie',
      specialty: 'Technicien d\'assistance',
      keywords: ['amadou', 'diallo', 'apprenant', 'technicien', 'assistance']
    },
    {
      id: 2,
      nom: 'Sow',
      prenom: 'Fatou',
      email: 'fatou.sow@lafaom.org',
      role: 'Formateur référent',
      specialty: 'Accueil, écoute et accompagnement',
      keywords: ['fatou', 'sow', 'formateur', 'référent', 'accueil', 'écoute']
    },
    {
      id: 3,
      nom: 'Ba',
      prenom: 'Ousmane',
      email: 'ousmane.ba@lafaom.org',
      role: 'Coordinateur pédagogique',
      specialty: 'Appui aux services pénitentiaires',
      keywords: ['ousmane', 'ba', 'coordinateur', 'pédagogique', 'appui', 'pénitentiaires']
    }
  ],

  // Formations simulées
  formations: [
    {
      id: 1,
      titre: 'Formation Auxiliaire de Vie - Spécialité Technicien d\'assistance',
      description: 'Formation complète de 12 mois à l\'Institut Lafaom-Mao',
      duree: '12 mois',
      lieu: 'Ziguinchor, Sénégal',
      keywords: ['auxiliaire', 'vie', 'technicien', 'assistance', '12', 'mois', 'lafaom', 'ziguinchor']
    },
    {
      id: 2,
      titre: 'Module Chef d\'œuvre - Réseau-parrain',
      description: 'Construction du réseau de solidarité pour plan d\'intervention individualisée',
      duree: '4 mois',
      phase: 'Projet collectif',
      keywords: ['chef', 'œuvre', 'réseau', 'parrain', 'solidarité', 'intervention', 'individualisée']
    },
    {
      id: 3,
      titre: 'Mission humanitaire - Association partenaire',
      description: 'Intégration pratique dans une association en faveur des détenus',
      duree: '3 mois',
      phase: 'Mission terrain',
      keywords: ['mission', 'humanitaire', 'association', 'partenaire', 'détenus', 'terrain']
    }
  ]
}

// Recherches populaires
const popularSearches = [
  { title: 'Utilisateurs', icon: 'ri-user-line', query: 'utilisateurs' },
  { title: 'Formations', icon: 'ri-graduation-cap-line', query: 'formations' },
  { title: 'Spécialités', icon: 'ri-award-line', query: 'spécialités' },
  { title: 'Projets', icon: 'ri-folder-line', query: 'projets' }
]

// Applications et pages par catégorie
const appCategories = [
  {
    title: 'SYSTÈME',
    items: [
      { title: 'Gestion Utilisateurs', icon: 'ri-user-line', path: '/system' },
      { title: 'Rôles & Permissions', icon: 'ri-shield-user-line', path: '/system' }
    ]
  },
  {
    title: 'FORMATION',
    items: [
      { title: 'Formations', icon: 'ri-graduation-cap-line', path: '/formations' },
      { title: 'Modules', icon: 'ri-book-line', path: '/formations' },
      { title: 'Évaluations', icon: 'ri-file-text-line', path: '/formations' }
    ]
  },
  {
    title: 'GESTION',
    items: [
      { title: 'Inscriptions', icon: 'ri-user-add-line', path: '/gestion' },
      { title: 'Paiements', icon: 'ri-money-dollar-circle-line', path: '/gestion' }
    ]
  },
  {
    title: 'PROJETS',
    items: [
      { title: 'Projets collectifs', icon: 'ri-team-line', path: '/projets' },
      { title: 'Chefs d\'œuvre', icon: 'ri-award-line', path: '/projets' }
    ]
  }
]

// Fonction de recherche
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) {
    return { pages: [], users: [], formations: [], specialties: [] }
  }

  const query = searchQuery.value.toLowerCase()

  // Fonction helper pour vérifier si un élément correspond à la recherche
  const matchesSearch = (item: any) => {
    const searchFields = [
      item.title?.toLowerCase(),
      item.nom?.toLowerCase(),
      item.prenom?.toLowerCase(),
      item.titre?.toLowerCase(),
      item.description?.toLowerCase(),
      item.email?.toLowerCase(),
      item.role?.toLowerCase(),
      item.specialty?.toLowerCase(),
      ...(item.keywords || [])
    ].filter(Boolean)

    return searchFields.some(field => field.includes(query))
  }

  return {
    pages: staticData.pages.filter(matchesSearch).slice(0, 5),
    users: staticData.users.filter(matchesSearch).slice(0, 5),
    formations: staticData.formations.filter(matchesSearch).slice(0, 5),
    specialties: staticData.specialties.filter(matchesSearch).slice(0, 3)
  }
})

// Navigation vers un résultat
const navigateToResult = (path: string, id?: number) => {
  const fullPath = id ? `${path}/${id}` : path
  router.push(fullPath)
  closeSearch()
}

// Effectuer une recherche populaire
const performPopularSearch = (query: string) => {
  searchQuery.value = query
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
  <VDialog v-model="isOpen" max-width="800" persistent class="global-search-dialog">
    <VCard class="global-search-card">
      <!-- En-tête avec champ de recherche -->
      <div class="search-header pa-4">
        <div class="d-flex align-center">
          <VIcon icon="ri-search-line" class="me-3" size="20" />
          <VTextField ref="searchInput" v-model="searchQuery" :placeholder="$t('search.placeholder')" variant="plain"
            hide-details class="search-input" autofocus />
          <VBtn icon variant="text" size="small" @click="closeSearch">
            <VIcon icon="ri-close-line" />
          </VBtn>
        </div>
      </div>

      <VDivider />

      <!-- Contenu de la recherche -->
      <div class="search-content" style="max-block-size: 500px; overflow-y: auto;">
        <!-- Résultats de recherche -->
        <div v-if="searchQuery.trim()" class="pa-4">
          <!-- Pages -->
          <div v-if="searchResults.pages.length" class="mb-6">
            <h6 class="text-h6 mb-3">{{ $t('search.results.pages') }}</h6>
            <div class="search-results">
              <div v-for="page in searchResults.pages" :key="page.path"
                class="search-result-item pa-3 rounded cursor-pointer" @click="navigateToResult(page.path)">
                <div class="d-flex align-center">
                  <VIcon :icon="page.icon" class="me-3" />
                  <div>
                    <div class="font-weight-medium">{{ page.title }}</div>
                    <small class="text-disabled">{{ page.description }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>



          <!-- Formations -->
          <div v-if="searchResults.formations.length" class="mb-6">
            <h6 class="text-h6 mb-3">{{ $t('search.results.formations') }}</h6>
            <div class="search-results">
              <div v-for="formation in searchResults.formations" :key="formation.id"
                class="search-result-item pa-3 rounded cursor-pointer"
                @click="navigateToResult('/formations', formation.id)">
                <div class="d-flex align-center">
                  <VIcon icon="ri-graduation-cap-line" class="me-3" />
                  <div>
                    <div class="font-weight-medium">{{ formation.titre }}</div>
                    <small class="text-disabled">{{ formation.description }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Spécialités -->
          <div v-if="searchResults.specialties.length" class="mb-6">
            <h6 class="text-h6 mb-3">{{ $t('search.results.specialties') }}</h6>
            <div class="search-results">
              <div v-for="specialty in searchResults.specialties" :key="specialty.title"
                class="search-result-item pa-3 rounded cursor-pointer" @click="navigateToResult(specialty.path)">
                <div class="d-flex align-center">
                  <VIcon :icon="specialty.icon" class="me-3" />
                  <div>
                    <div class="font-weight-medium">{{ specialty.title }}</div>
                    <small class="text-disabled">{{ specialty.description }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Aucun résultat -->
          <div
            v-if="!searchResults.pages.length && !searchResults.users.length && !searchResults.formations.length && !searchResults.specialties.length"
            class="pa-6 text-center">
            <VIcon icon="ri-search-line" size="48" class="text-disabled mb-3" />
            <p class="text-disabled">{{ $t('search.no_results') }} "{{ searchQuery }}"</p>
          </div>
        </div>

        <!-- État initial (pas de recherche) -->
        <div v-else class="pa-4">
          <!-- Recherches populaires -->
          <div class="mb-6">
            <h6 class="text-h6 mb-3">{{ $t('search.popular_searches') }}</h6>
            <div class="d-flex flex-wrap gap-2">
              <VChip v-for="search in popularSearches" :key="search.title" variant="tonal" size="small"
                @click="performPopularSearch(search.query)">
                <VIcon :icon="search.icon" start size="16" />
                {{ search.title }}
              </VChip>
            </div>
          </div>

          <!-- Applications et pages -->
          <div>
            <h6 class="text-h6 mb-3">{{ $t('search.apps_pages') }}</h6>
            <VRow>
              <VCol v-for="category in appCategories" :key="category.title" cols="12" md="6">
                <div class="mb-4">
                  <h6 class="text-subtitle-2 mb-2 text-disabled">{{ category.title }}</h6>
                  <div class="search-results">
                    <div v-for="item in category.items" :key="item.path"
                      class="search-result-item pa-2 rounded cursor-pointer" @click="navigateToResult(item.path)">
                      <div class="d-flex align-center">
                        <VIcon :icon="item.icon" class="me-3" size="20" />
                        <span class="font-weight-medium">{{ item.title }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </VCol>
            </VRow>
          </div>
        </div>
      </div>

      <!-- Pied de page avec raccourcis -->
      <VDivider />
      <div class="search-footer pa-3">
        <div class="d-flex justify-space-between align-center text-caption text-disabled">
          <span>{{ $t('search.shortcuts.navigate') }}</span>
          <div class="d-flex gap-2 align-center">
            <VChip size="x-small" variant="outlined">↵</VChip>
            <span>{{ $t('search.shortcuts.select') }}</span>
            <VChip size="x-small" variant="outlined">esc</VChip>
            <span>{{ $t('search.shortcuts.close') }}</span>
          </div>
        </div>
      </div>
    </VCard>
  </VDialog>
</template>

<style scoped>
.global-search-dialog :deep(.v-overlay__content) {
  margin-block: 10vh auto;
}

.global-search-card {
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 10%), 0 10px 10px -5px rgba(0, 0, 0, 4%);
}

.search-header {
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-surface), 0.8);
}

.search-input :deep(.v-field__input) {
  padding: 0;
  font-size: 1.1rem;
}

.search-result-item {
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.search-result-item:hover {
  border-color: rgba(var(--v-theme-primary), 0.2);
  background: rgba(var(--v-theme-primary), 0.08);
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.search-footer {
  background: rgba(var(--v-theme-surface), 0.5);
}
</style>
