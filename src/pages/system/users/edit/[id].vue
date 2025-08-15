<script setup lang="ts">
import { UsersApi } from '@/utils/services'
import type { SexeEnum, StatutCompteEnum } from '@/utils/types/enums'
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
const isSaving = ref(false)
const error = ref<string | null>(null)

// ID de l'utilisateur depuis la route
const userId = computed(() => parseInt(route.params.id as string))

// Formulaire
const form = ref({
  nom: '',
  prenom: '',
  email: '',
  sexe: 'homme' as SexeEnum,
  statut: 'actif' as StatutCompteEnum,
  role_id: null as number | null
})

// Options pour les sélecteurs
const sexeOptions = [
  { title: 'Homme', value: 'homme' },
  { title: 'Femme', value: 'femme' }
]

const statutOptions = [
  { title: 'Actif', value: 'actif' },
  { title: 'Inactif', value: 'inactif' },
  { title: 'Suspendu', value: 'suspendu' }
]

const roleOptions = [
  { title: 'Administrateur', value: 1 },
  { title: 'Coordinateur pédagogique', value: 2 },
  { title: 'Formateur référent', value: 3 },
  { title: 'Référent de spécialité', value: 4 },
  { title: 'Apprenant auxiliaire de vie', value: 5 },
  { title: 'Spécialiste Technicien d\'assistance', value: 6 },
  { title: 'Spécialiste Appui services pénitentiaires', value: 7 },
  { title: 'Spécialiste Accueil, écoute et accompagnement', value: 8 }
]

// Règles de validation
const rules = {
  nom: [(v: string) => !!v || 'Le nom est requis'],
  prenom: [(v: string) => !!v || 'Le prénom est requis'],
  email: [
    (v: string) => !!v || 'L\'email est requis',
    (v: string) => /.+@.+\..+/.test(v) || 'L\'email doit être valide'
  ]
}

// Fonction pour récupérer les détails de l'utilisateur
const fetchUser = async () => {
  if (!userId.value) return

  isLoading.value = true
  error.value = null

  try {
    user.value = await UsersApi.get(userId.value)

    // Remplir le formulaire avec les données existantes
    if (user.value) {
      form.value = {
        nom: user.value.nom,
        prenom: user.value.prenom || '',
        email: user.value.email,
        sexe: user.value.sexe,
        statut: user.value.statut,
        role_id: user.value.role?.id || null
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la récupération de l\'utilisateur'
    console.error('Erreur:', err)
  } finally {
    isLoading.value = false
  }
}

// Fonction pour sauvegarder les modifications
const saveUser = async () => {
  if (!userId.value) return

  isSaving.value = true
  error.value = null

  try {
    const payload = { ...form.value, role_id: form.value.role_id ?? undefined }
    await UsersApi.update(userId.value, payload)

    // Rediriger vers la page de profil
    router.push(`/system/users/${userId.value}`)
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la sauvegarde'
    console.error('Erreur:', err)
  } finally {
    isSaving.value = false
  }
}

// Fonction pour annuler et retourner
const cancel = () => {
  router.push(`/system/`)
}

// Charger les données au montage
onMounted(() => {
  fetchUser()
})
</script>

<template>
  <div>
    <!-- En-tête -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h4 mb-2">Modifier l'utilisateur</h2>
        <p class="text-body-1 text-disabled mb-0">
          Modifiez les informations de l'utilisateur
        </p>
      </div>

      <VBtn variant="text" color="default" @click="cancel">
        <VIcon start icon="ri-arrow-left-line" />
        Retour
      </VBtn>
    </div>

    <!-- Chargement -->
    <div v-if="isLoading" class="d-flex justify-center align-center" style="min-block-size: 400px;">
      <VProgressCircular indeterminate color="primary" size="64" />
    </div>

    <!-- Erreur -->
    <VAlert v-else-if="error" type="error" variant="tonal" class="mb-6">
      {{ error }}
    </VAlert>

    <!-- Formulaire -->
    <VCard v-else-if="user">
      <VCardTitle>Informations personnelles</VCardTitle>

      <VCardText>
        <VForm @submit.prevent="saveUser">
          <VRow>
            <!-- Nom -->
            <VCol cols="12" md="6">
              <VTextField v-model="form.nom" :label="$t('system.users.edit.last_name')" :rules="rules.nom"
                variant="outlined" required />
            </VCol>

            <!-- Prénom -->
            <VCol cols="12" md="6">
              <VTextField v-model="form.prenom" :label="$t('system.users.edit.first_name')" :rules="rules.prenom"
                variant="outlined" required />
            </VCol>

            <!-- Email -->
            <VCol cols="12" md="6">
              <VTextField v-model="form.email" :label="$t('system.users.edit.email')" :rules="rules.email"
                variant="outlined" type="email" required />
            </VCol>

            <!-- Sexe -->
            <VCol cols="12" md="6">
              <VSelect v-model="form.sexe" :label="$t('system.users.edit.gender')" :items="sexeOptions"
                variant="outlined" />
            </VCol>

            <!-- Rôle -->
            <VCol cols="12" md="6">
              <VSelect v-model="form.role_id" :label="$t('system.users.edit.role')" :items="roleOptions"
                variant="outlined" clearable />
            </VCol>

            <!-- Statut -->
            <VCol cols="12" md="6">
              <VSelect v-model="form.statut" :label="$t('system.users.details.status')" :items="statutOptions"
                variant="outlined" />
            </VCol>
          </VRow>

          <!-- Actions -->
          <div class="d-flex gap-4 mt-6">
            <VBtn type="submit" color="primary" variant="flat" :loading="isSaving" :disabled="isSaving">
              <VIcon start icon="ri-save-line" />
              Enregistrer les modifications
            </VBtn>

            <VBtn color="secondary" variant="outlined" @click="cancel" :disabled="isSaving">
              <VIcon start icon="ri-close-line" />
              Annuler
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
