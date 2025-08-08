<script setup lang="ts">
import { UsersApi } from '@/utils/services'
import type { Utilisateur } from '@/utils/types/models'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Type étendu pour les utilisateurs avec fullName
interface UtilisateurWithFullName extends Utilisateur {
  fullName: string
}

// États
const users = ref<UtilisateurWithFullName[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const selectedUsers = ref<number[]>([])
const searchQuery = ref('')
const selectedRole = ref('')
const showAddUserDialog = ref(false)
const showDeleteDialog = ref(false)
const userToDelete = ref<UtilisateurWithFullName | null>(null)

// Formulaire d'ajout d'utilisateur
const userForm = ref({
  nom: '',
  prenom: '',
  email: '',
  sexe: 'homme' as 'homme' | 'femme',
  role_name: 'admin' as 'admin' | 'coordonnateur' | 'formateur' | 'referent' | 'apprenant',
})

// Rôles disponibles
const roles = ref([
  { id: 1, nom: 'admin', label: 'Administrateur' },
  { id: 2, nom: 'coordonnateur', label: 'Coordinateur' },
  { id: 3, nom: 'formateur', label: 'Formateur' },
  { id: 4, nom: 'referent', label: 'Référent' },
  { id: 5, nom: 'apprenant', label: 'Apprenant' },
])

// Configuration du tableau
const headers = [
  { title: 'UTILISATEUR', key: 'fullName', sortable: true },
  { title: 'EMAIL', key: 'email', sortable: true },
  { title: 'RÔLE', key: 'role', sortable: true },
  { title: 'STATUT', key: 'statut', sortable: true },
  { title: 'DATE CRÉATION', key: 'created_at', sortable: true },
  { title: 'ACTIONS', key: 'actions', sortable: false },
]

// Utilisateurs filtrés
const filteredUsers = computed(() => {
  let filtered = [...users.value]

  // Filtrage par rôle
  if (selectedRole.value) {
    filtered = filtered.filter(user => {
      const userRole = user.role?.nom?.toLowerCase() || ''
      return userRole === selectedRole.value.toLowerCase()
    })
  }

  // Filtrage par recherche
  if (searchQuery.value && searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(user => {
      const fullName = user.fullName.toLowerCase()
      const email = user.email.toLowerCase()
      const role = (user.role?.nom || '').toLowerCase()

      return fullName.includes(query) ||
             email.includes(query) ||
             role.includes(query)
    })
  }

  return filtered
})

// Fonction pour récupérer les utilisateurs
const fetchUsers = async () => {
  isLoading.value = true
  error.value = null

  try {
    const response = await UsersApi.list({ skip: 0, limit: 100 })
    users.value = response.map((user: Utilisateur) => ({
      ...user,
      fullName: `${user.prenom || ''} ${user.nom}`.trim(),
    }))
  } catch (err: any) {
    error.value = err.message || t('users.errors.fetchFailed')
    console.error('Erreur lors de la récupération des utilisateurs:', err)
  } finally {
    isLoading.value = false
  }
}

// Fonction pour supprimer un utilisateur
const deleteUser = async () => {
  if (!userToDelete.value) return

  try {
    await UsersApi.remove(userToDelete.value.id)
    await fetchUsers() // Recharger la liste
    showDeleteDialog.value = false
    userToDelete.value = null
  } catch (err: any) {
    error.value = err.message || t('users.errors.deleteFailed')
    console.error('Erreur lors de la suppression:', err)
  }
}

// Fonction pour confirmer la suppression
const confirmDelete = (user: UtilisateurWithFullName) => {
  userToDelete.value = user
  showDeleteDialog.value = true
}

// Fonction pour ajouter un utilisateur
const addUser = async () => {
  try {
    await UsersApi.create(userForm.value)
    await fetchUsers()
    showAddUserDialog.value = false
    // Réinitialiser le formulaire
    userForm.value = {
      nom: '',
      prenom: '',
      email: '',
      sexe: 'homme',
      role_name: 'admin',
    }
  } catch (err: any) {
    error.value = err.message || t('users.errors.addFailed')
    console.error('Erreur lors de l\'ajout:', err)
  }
}

// Fonction pour résoudre la couleur du statut
const resolveStatusVariant = (statut: string) => {
  switch (statut.toLowerCase()) {
    case 'actif':
      return { color: 'success', text: t('users.status.active') }
    case 'inactif':
      return { color: 'error', text: t('users.status.inactive') }
    case 'suspendu':
      return { color: 'warning', text: t('users.status.suspended') }
    default:
      return { color: 'info', text: statut }
  }
}

// Fonction pour résoudre la couleur du rôle
const resolveRoleVariant = (role: string) => {
  switch (role.toLowerCase()) {
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

// Fonction pour générer les initiales
const avatarText = (name: string) => {
  const names = name.split(' ')
  return names.map(n => n.charAt(0)).join('').toUpperCase()
}

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}



// Charger les données au montage
onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div>
    <!-- En-tête -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h4 class="text-h4 mb-1">
          {{ t('users.title') }}
        </h4>
        <p class="text-body-1 mb-0">
          {{ t('users.subtitle') }}
        </p>
      </div>

      <VBtn
        color="primary"
        @click="showAddUserDialog = true"
      >
        <VIcon start icon="ri-add-line" />
        {{ t('users.addUser') }}
      </VBtn>
    </div>

    <!-- Filtres et recherche -->
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol cols="12" md="6">
            <VTextField
              v-model="searchQuery"
              :placeholder="t('users.searchPlaceholder')"
              prepend-inner-icon="ri-search-line"
              clearable
            />
          </VCol>
          <VCol cols="12" md="3">
            <VSelect
              v-model="selectedRole"
              :label="t('users.filterByRole')"
              :items="[
                { title: t('users.roles.admin'), value: 'admin' },
                { title: t('users.roles.coordinator'), value: 'coordonnateur' },
                { title: t('users.roles.trainer'), value: 'formateur' },
                { title: t('users.roles.referent'), value: 'referent' },
                { title: t('users.roles.learner'), value: 'apprenant' }
              ]"
              clearable
            />
          </VCol>
          <VCol cols="12" md="3">
            <VBtn
              variant="outlined"
              @click="fetchUsers"
              :loading="isLoading"
            >
              <VIcon start icon="ri-refresh-line" />
              {{ t('common.refresh') }}
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Message d'erreur -->
    <VAlert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-6"
      closable
      @click:close="error = null"
    >
      {{ error }}
    </VAlert>

    <!-- Tableau des utilisateurs -->
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span>{{ t('users.title') }}</span>
        <VChip
          v-if="filteredUsers.length !== users.length"
          color="primary"
          variant="tonal"
          size="small"
        >
          {{ t('users.count.filtered', { count: filteredUsers.length, total: users.length }) }}
        </VChip>
        <VChip
          v-else
          color="success"
          variant="tonal"
          size="small"
        >
          {{ users.length }} {{ users.length === 1 ? t('users.count.single') : t('users.count.plural') }}
        </VChip>
      </VCardTitle>

      <VDataTable
        v-model="selectedUsers"
        :headers="headers"
        :items="filteredUsers"
        :loading="isLoading"
        :items-per-page="10"
        show-select
        class="text-no-wrap"
      >
        <!-- Nom complet avec avatar -->
        <template #item.fullName="{ item }">
          <div class="d-flex align-center">
            <VAvatar
              size="32"
              color="primary"
              variant="tonal"
            >
              <span class="text-sm">{{ avatarText(item.fullName) }}</span>
            </VAvatar>
            <div class="d-flex flex-column ms-3">
              <RouterLink
                :to="`/system/users/${item.id}`"
                class="text-decoration-none"
              >
                <span class="d-block font-weight-medium text-primary text-truncate cursor-pointer">
                  {{ item.fullName }}
                </span>
              </RouterLink>
              <small>{{ item.email }}</small>
            </div>
          </div>
        </template>

        <!-- Rôle -->
        <template #item.role="{ item }">
          <VChip
            :color="resolveRoleVariant(item.role?.nom || '').color"
            :prepend-icon="resolveRoleVariant(item.role?.nom || '').icon"
            size="small"
            variant="tonal"
          >
            {{ item.role?.nom || t('users.noRole') }}
          </VChip>
        </template>

        <!-- Statut -->
        <template #item.statut="{ item }">
          <VChip
            :color="resolveStatusVariant(item.statut).color"
            class="font-weight-medium"
            size="small"
          >
            {{ resolveStatusVariant(item.statut).text }}
          </VChip>
        </template>

        <!-- Date de création -->
        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-2">
            <VBtn
              icon
              size="small"
              color="primary"
              variant="text"
              :to="`/system/users/${item.id}`"
            >
              <VIcon icon="ri-eye-line" />
              <VTooltip activator="parent">
                {{ t('users.actions.view') }}
              </VTooltip>
            </VBtn>

            <VBtn
              icon
              size="small"
              color="info"
              variant="text"
              :to="`/system/users/${item.id}/edit`"
            >
              <VIcon icon="ri-edit-line" />
              <VTooltip activator="parent">
                {{ t('users.actions.edit') }}
              </VTooltip>
            </VBtn>

            <VBtn
              icon
              size="small"
              color="error"
              variant="text"
              @click="confirmDelete(item)"
            >
              <VIcon icon="ri-delete-bin-line" />
              <VTooltip activator="parent">
                {{ t('users.actions.delete') }}
              </VTooltip>
            </VBtn>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Dialog de confirmation de suppression -->
    <VDialog
      v-model="showDeleteDialog"
      max-width="400"
    >
      <VCard>
        <VCardTitle class="text-h6">
          {{ t('users.deleteDialog.title') }}
        </VCardTitle>

        <VCardText>
          {{ t('users.deleteDialog.message', { name: userToDelete?.fullName }) }}
        </VCardText>

        <VCardActions>
          <VSpacer />

          <VBtn
            color="grey"
            variant="outlined"
            @click="showDeleteDialog = false"
          >
            {{ t('common.cancel') }}
          </VBtn>

          <VBtn
            color="error"
            @click="deleteUser"
          >
            {{ t('users.actions.delete') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Dialog d'ajout d'utilisateur -->
    <VDialog
      v-model="showAddUserDialog"
      max-width="600"
    >
      <VCard>
        <VCardTitle class="text-h6">
          {{ t('users.addDialog.title') }}
        </VCardTitle>

        <VCardText>
          <VForm @submit.prevent="addUser">
            <VRow>
              <VCol cols="12" md="6">
                <VTextField
                  v-model="userForm.nom"
                  :label="t('users.addDialog.form.lastName')"
                  required
                />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField
                  v-model="userForm.prenom"
                  :label="t('users.addDialog.form.firstName')"
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  v-model="userForm.email"
                  :label="t('users.addDialog.form.email')"
                  type="email"
                  required
                />
              </VCol>
              <VCol cols="12" md="6">
                <VSelect
                  v-model="userForm.sexe"
                  :label="t('users.addDialog.form.gender')"
                  :items="[
                    { title: t('users.addDialog.form.genderOptions.male'), value: 'homme' },
                    { title: t('users.addDialog.form.genderOptions.female'), value: 'femme' }
                  ]"
                  required
                />
              </VCol>
              <VCol cols="12" md="6">
                <VSelect
                  v-model="userForm.role_name"
                  :label="t('users.addDialog.form.role')"
                  :items="roles.map(r => ({ title: r.label, value: r.nom }))"
                  required
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>

        <VCardActions>
          <VSpacer />

          <VBtn
            color="grey"
            variant="outlined"
            @click="showAddUserDialog = false"
          >
            {{ t('users.addDialog.actions.cancel') }}
          </VBtn>

          <VBtn
            color="primary"
            @click="addUser"
          >
            {{ t('users.addDialog.actions.add') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

