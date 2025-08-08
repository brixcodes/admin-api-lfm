<script setup lang="ts">
import { UsersApi } from '@/utils/services'
import type { Utilisateur } from '@/utils/types/models'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// États
const user = ref<Utilisateur | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const activeTab = ref('overview')

// ID de l'utilisateur depuis la route
const userId = computed(() => parseInt(route.params.id as string))

// Données simulées pour les projets et activités (contexte Lafaom-Mao)
const projects = ref([
  {
    id: 1,
    name: 'Formation Auxiliaire de Vie - Spécialité Technicien d\'assistance',
    type: 'Formation principale',
    progress: 78,
    totalTasks: 240,
    completedTasks: 187,
    hours: '180:42',
    color: 'success',
    phase: 'Projet collectif'
  },
  {
    id: 2,
    name: 'Chef d\'œuvre - Réseau-parrain',
    type: 'Chef d\'œuvre',
    progress: 45,
    totalTasks: 56,
    completedTasks: 25,
    hours: '120:30',
    color: 'primary',
    phase: 'En cours'
  },
  {
    id: 3,
    name: 'Mission humanitaire - Association partenaire',
    type: 'Mission',
    progress: 0,
    totalTasks: 90,
    completedTasks: 0,
    hours: '0:00',
    color: 'info',
    phase: 'À venir'
  }
])

const activities = ref([
  {
    id: 1,
    type: 'formation',
    title: 'Phase d\'intégration terminée',
    description: 'Intégration de 2 mois dans l\'établissement pénitencier complétée',
    time: '1 semaine',
    icon: 'ri-building-line',
    color: 'success'
  },
  {
    id: 2,
    type: 'meeting',
    title: 'Entretien avec le formateur référent',
    description: 'Choix de la spécialité Technicien d\'assistance validé',
    time: '2 semaines',
    icon: 'ri-user-heart-line',
    color: 'primary'
  },
  {
    id: 3,
    type: 'project',
    title: 'Chef d\'œuvre sélectionné',
    description: 'Construction du réseau-parrain pour plan d\'intervention individualisée',
    time: '3 semaines',
    icon: 'ri-award-line',
    color: 'warning'
  },
  {
    id: 4,
    type: 'administrative',
    title: 'Accréditations obtenues',
    description: 'Toutes les accréditations nécessaires à la formation validées',
    time: '1 mois',
    icon: 'ri-shield-check-line',
    color: 'info'
  }
])

// Fonction pour récupérer les détails de l'utilisateur
const fetchUser = async () => {
  if (!userId.value) return
  
  isLoading.value = true
  error.value = null

  try {
    user.value = await UsersApi.get(userId.value)
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la récupération de l\'utilisateur'
    console.error('Erreur:', err)
  } finally {
    isLoading.value = false
  }
}

// Fonction pour générer les initiales
const avatarText = computed(() => {
  if (!user.value) return ''
  const names = `${user.value.prenom || ''} ${user.value.nom}`.trim()
  return names.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
})

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Fonction pour résoudre la couleur du rôle
const resolveRoleVariant = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return { color: 'error', icon: 'ri-shield-star-line' }
    case 'coordonnateur':
      return { color: 'primary', icon: 'ri-user-settings-line' }
    case 'formateur':
      return { color: 'info', icon: 'ri-graduation-cap-line' }
    case 'referent':
      return { color: 'warning', icon: 'ri-user-heart-line' }
    case 'apprenant':
      return { color: 'success', icon: 'ri-user-line' }
    default:
      return { color: 'secondary', icon: 'ri-user-line' }
  }
}

// Fonction pour résoudre la couleur du statut
const resolveStatusVariant = (statut: string) => {
  switch (statut?.toLowerCase()) {
    case 'actif':
      return { color: 'success', text: 'Actif' }
    case 'inactif':
      return { color: 'error', text: 'Inactif' }
    case 'suspendu':
      return { color: 'warning', text: 'Suspendu' }
    default:
      return { color: 'info', text: statut }
  }
}

// Charger les données au montage
onMounted(() => {
  fetchUser()
})
</script>

<template>
  <div>
    <!-- Bouton retour -->
    <VBtn
      variant="text"
      color="default"
      class="mb-4"
      @click="router.back()"
    >
      <VIcon start icon="ri-arrow-left-line" />
      {{ t('users.profile.backButton') }}
    </VBtn>

    <!-- Chargement -->
    <div v-if="isLoading" class="d-flex justify-center align-center" style="min-block-size: 400px;">
      <VProgressCircular
        indeterminate
        color="primary"
        size="64"
      />
    </div>

    <!-- Erreur -->
    <VAlert
      v-else-if="error"
      type="error"
      variant="tonal"
      class="mb-6"
    >
      {{ error }}
    </VAlert>

    <!-- Contenu principal -->
    <div v-else-if="user">
      <!-- En-tête avec profil utilisateur -->
      <VCard class="mb-6">
        <VCardText class="pb-0">
          <VRow>
            <!-- Avatar et informations principales -->
            <VCol cols="12" md="4" class="text-center">
              <VAvatar
                size="120"
                color="primary"
                variant="tonal"
                class="mb-4"
              >
                <span class="text-h4">{{ avatarText }}</span>
              </VAvatar>
              
              <h3 class="text-h5 mb-2">
                {{ user.prenom }} {{ user.nom }}
              </h3>
              
              <VChip
                :color="resolveRoleVariant(user.role?.nom || '').color"
                :prepend-icon="resolveRoleVariant(user.role?.nom || '').icon"
                variant="tonal"
                class="mb-4"
              >
                {{ user.role?.nom || 'Aucun rôle' }}
              </VChip>

              <!-- Statistiques -->
              <VRow class="text-center">
                <VCol cols="4">
                  <div class="d-flex align-center justify-center mb-2">
                    <VIcon icon="ri-graduation-cap-line" color="success" class="me-2" />
                    <span class="text-h6">8</span>
                  </div>
                  <small class="text-disabled">Mois de formation</small>
                </VCol>
                <VCol cols="4">
                  <div class="d-flex align-center justify-center mb-2">
                    <VIcon icon="ri-award-line" color="warning" class="me-2" />
                    <span class="text-h6">1</span>
                  </div>
                  <small class="text-disabled">Chef d'œuvre</small>
                </VCol>
                <VCol cols="4">
                  <div class="d-flex align-center justify-center mb-2">
                    <VIcon icon="ri-team-line" color="primary" class="me-2" />
                    <span class="text-h6">2</span>
                  </div>
                  <small class="text-disabled">Projets collectifs</small>
                </VCol>
              </VRow>
            </VCol>

            <!-- Détails -->
            <VCol cols="12" md="8">
              <h4 class="text-h6 mb-4">Détails</h4>
              
              <VRow>
                <VCol cols="12" sm="6">
                  <div class="mb-4">
                    <small class="text-disabled">Email</small>
                    <div class="text-body-1">{{ user.email }}</div>
                  </div>
                </VCol>
                <VCol cols="12" sm="6">
                  <div class="mb-4">
                    <small class="text-disabled">Statut</small>
                    <div>
                      <VChip
                        :color="resolveStatusVariant(user.statut).color"
                        size="small"
                        variant="tonal"
                      >
                        {{ resolveStatusVariant(user.statut).text }}
                      </VChip>
                    </div>
                  </div>
                </VCol>
                <VCol cols="12" sm="6">
                  <div class="mb-4">
                    <small class="text-disabled">Sexe</small>
                    <div class="text-body-1">{{ user.sexe === 'homme' ? 'Homme' : 'Femme' }}</div>
                  </div>
                </VCol>
                <VCol cols="12" sm="6">
                  <div class="mb-4">
                    <small class="text-disabled">Date de création</small>
                    <div class="text-body-1">{{ formatDate(user.created_at) }}</div>
                  </div>
                </VCol>
              </VRow>

              <!-- Actions -->
              <div class="d-flex gap-3 mt-4">
                <VBtn
                  color="primary"
                  variant="flat"
                  :to="`/system/users/${user.id}/edit`"
                >
                  <VIcon start icon="ri-edit-line" />
                  Modifier
                </VBtn>
                
                <VBtn
                  color="error"
                  variant="outlined"
                  v-if="user.statut === 'actif'"
                >
                  <VIcon start icon="ri-user-forbid-line" />
                  Désactiver
                </VBtn>

                <VBtn
                  color="success"
                  variant="outlined"
                  v-else-if="user.statut === 'inactif'"
                >
                  <VIcon start icon="ri-user-line" />
                  Réactiver
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Onglets -->
      <VTabs
        v-model="activeTab"
        color="primary"
        class="mb-6"
      >
        <VTab value="overview">
          <VIcon start icon="ri-dashboard-line" />
          Vue d'ensemble
        </VTab>
        <VTab value="projects">
          <VIcon start icon="ri-folder-line" />
          Projets
        </VTab>
        <VTab value="activity">
          <VIcon start icon="ri-time-line" />
          Activité
        </VTab>
        <VTab value="permissions">
          <VIcon start icon="ri-key-2-line" />
          Permissions
        </VTab>
      </VTabs>

      <!-- Contenu des onglets -->
      <VWindow v-model="activeTab">
        <!-- Vue d'ensemble -->
        <VWindowItem value="overview">
          <VRow>
            <VCol cols="12" md="8">
              <!-- Projets récents -->
              <VCard class="mb-6">
                <VCardTitle>Projets récents</VCardTitle>
                <VCardText>
                  <div v-for="project in projects.slice(0, 3)" :key="project.id" class="mb-4">
                    <div class="d-flex justify-space-between align-center mb-2">
                      <div>
                        <h6 class="text-subtitle-1">{{ project.name }}</h6>
                        <small class="text-disabled">{{ project.type }}</small>
                      </div>
                      <VChip
                        :color="project.color"
                        size="small"
                        variant="tonal"
                      >
                        {{ project.progress }}%
                      </VChip>
                    </div>
                    <VProgressLinear
                      :model-value="project.progress"
                      :color="project.color"
                      height="6"
                      rounded
                    />
                  </div>
                </VCardText>
              </VCard>
            </VCol>
            
            <VCol cols="12" md="4">
              <!-- Activité récente -->
              <VCard>
                <VCardTitle>Activité récente</VCardTitle>
                <VCardText>
                  <VTimeline
                    side="end"
                    align="start"
                    line-inset="8"
                    truncate-line="both"
                    density="compact"
                  >
                    <VTimelineItem
                      v-for="activity in activities.slice(0, 3)"
                      :key="activity.id"
                      :dot-color="activity.color"
                      size="small"
                    >
                      <template #icon>
                        <VIcon :icon="activity.icon" size="16" />
                      </template>
                      
                      <div class="mb-2">
                        <h6 class="text-subtitle-2">{{ activity.title }}</h6>
                        <p class="text-body-2 mb-1">{{ activity.description }}</p>
                        <small class="text-disabled">{{ activity.time }}</small>
                      </div>
                    </VTimelineItem>
                  </VTimeline>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VWindowItem>

        <!-- Projets -->
        <VWindowItem value="projects">
          <VCard>
            <VCardTitle>
              <div class="d-flex justify-space-between align-center">
                <span>Liste des projets</span>
                <VTextField
                  placeholder="Rechercher un projet"
                  prepend-inner-icon="ri-search-line"
                  variant="outlined"
                  density="compact"
                  style="max-inline-size: 300px;"
                />
              </div>
            </VCardTitle>
            
            <VCardText>
              <VDataTable
                :headers="[
                  { title: 'FORMATION/PROJET', key: 'name' },
                  { title: 'TYPE', key: 'type' },
                  { title: 'PHASE', key: 'phase' },
                  { title: 'PROGRÈS', key: 'progress' },
                  { title: 'HEURES', key: 'hours' }
                ]"
                :items="projects"
                :items-per-page="10"
              >
                <template #item.name="{ item }">
                  <div class="d-flex align-center">
                    <VAvatar
                      size="32"
                      :color="item.color"
                      variant="tonal"
                      class="me-3"
                    >
                      <VIcon icon="ri-folder-line" />
                    </VAvatar>
                    <div>
                      <div class="font-weight-medium">{{ item.name }}</div>
                      <small class="text-disabled">{{ item.type }}</small>
                    </div>
                  </div>
                </template>
                
                <template #item.phase="{ item }">
                  <VChip
                    :color="item.color"
                    size="small"
                    variant="tonal"
                  >
                    {{ item.phase }}
                  </VChip>
                </template>
                
                <template #item.progress="{ item }">
                  <div class="d-flex align-center">
                    <VProgressLinear
                      :model-value="item.progress"
                      :color="item.color"
                      height="6"
                      rounded
                      class="me-3"
                      style="min-inline-size: 80px;"
                    />
                    <span class="text-body-2">{{ item.progress }}%</span>
                  </div>
                </template>
              </VDataTable>
            </VCardText>
          </VCard>
        </VWindowItem>

        <!-- Activité -->
        <VWindowItem value="activity">
          <VCard>
            <VCardTitle>Chronologie d'activité</VCardTitle>
            <VCardText>
              <VTimeline
                side="end"
                align="start"
                line-inset="12"
              >
                <VTimelineItem
                  v-for="activity in activities"
                  :key="activity.id"
                  :dot-color="activity.color"
                  size="small"
                >
                  <template #icon>
                    <VIcon :icon="activity.icon" />
                  </template>
                  
                  <VCard variant="tonal" :color="activity.color">
                    <VCardText>
                      <div class="d-flex justify-space-between align-start mb-2">
                        <h6 class="text-subtitle-1">{{ activity.title }}</h6>
                        <small class="text-disabled">{{ activity.time }}</small>
                      </div>
                      <p class="text-body-2 mb-0">{{ activity.description }}</p>
                    </VCardText>
                  </VCard>
                </VTimelineItem>
              </VTimeline>
            </VCardText>
          </VCard>
        </VWindowItem>

        <!-- Permissions -->
        <VWindowItem value="permissions">
          <VCard>
            <VCardTitle>Permissions et rôles</VCardTitle>
            <VCardText>
              <VAlert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                <VIcon start icon="ri-information-line" />
                Les permissions sont gérées via les rôles. Contactez un administrateur pour modifier les permissions.
              </VAlert>
              
              <div class="mb-4">
                <h6 class="text-subtitle-1 mb-2">Rôle actuel</h6>
                <VChip
                  :color="resolveRoleVariant(user.role?.nom || '').color"
                  :prepend-icon="resolveRoleVariant(user.role?.nom || '').icon"
                  variant="tonal"
                  size="large"
                >
                  {{ user.role?.nom || 'Aucun rôle' }}
                </VChip>
              </div>
              
              <div>
                <h6 class="text-subtitle-1 mb-3">Permissions associées</h6>
                <VRow>
                  <VCol cols="12" sm="6" md="4" v-for="permission in ['Lecture', 'Écriture', 'Modification', 'Suppression']" :key="permission">
                    <VCard variant="outlined">
                      <VCardText class="text-center">
                        <VIcon icon="ri-check-line" color="success" size="24" class="mb-2" />
                        <div class="text-body-2">{{ permission }}</div>
                      </VCardText>
                    </VCard>
                  </VCol>
                </VRow>
              </div>
            </VCardText>
          </VCard>
        </VWindowItem>
      </VWindow>
    </div>
  </div>
</template>
