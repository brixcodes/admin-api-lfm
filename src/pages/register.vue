<script setup lang="ts">
import { useAuth } from '@/utils/auth'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import authV1MaskDark from '@images/pages/auth-v1-mask-dark.png'
import authV1MaskLight from '@images/pages/auth-v1-mask-light.png'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

const logo = '/logo_lafaom.png'

const router = useRouter()
const { register, isLoading, error, clearError } = useAuth()
const { t } = useI18n()

const form = ref({
  nom: '',
  prenom: '',
  sexe: 'homme' as 'homme' | 'femme',
  email: '',
  role_name: 'apprenant' as 'admin' | 'coordonnateur' | 'formateur' | 'referent' | 'apprenant',
})

const vuetifyTheme = useTheme()

const authThemeMask = computed(() => {
  return vuetifyTheme.global.name.value === 'light'
    ? authV1MaskLight
    : authV1MaskDark
})

// Options pour les sélecteurs
const sexeOptions = computed(() => [
  { title: t('register.male'), value: 'homme' },
  { title: t('register.female'), value: 'femme' },
])

const roleOptions = computed(() => [
  {
    title: t('register.student'),
    value: 'apprenant',
    subtitle: t('register.studentDesc')
  },
  {
    title: t('register.trainer'),
    value: 'formateur',
    subtitle: t('register.trainerDesc')
  },
  {
    title: t('register.referent'),
    value: 'referent',
    subtitle: t('register.referentDesc')
  },
  {
    title: t('register.coordinator'),
    value: 'coordonnateur',
    subtitle: t('register.coordinatorDesc')
  },
  {
    title: t('register.admin'),
    value: 'admin',
    subtitle: t('register.adminDesc')
  },
])

// Validation du formulaire
const isFormValid = computed(() => {
  return (
    form.value.nom.trim() &&
    form.value.prenom.trim() &&
    form.value.email.includes('@') &&
    form.value.sexe &&
    form.value.role_name
  )
})

// Fonction d'inscription
const handleRegister = async () => {
  if (!isFormValid.value) {
    return
  }

  // Effacer les erreurs précédentes
  clearError()

  try {
    await register({
      nom: form.value.nom.trim(),
      prenom: form.value.prenom.trim(),
      sexe: form.value.sexe,
      email: form.value.email.trim(),
      role_name: form.value.role_name,
    })
    
    // Inscription réussie, rediriger vers la page de connexion
    router.push('/login')
  } catch (err) {
    // L'erreur est déjà gérée par le service d'authentification
    console.error('Erreur d\'inscription:', err)
  }
}

// Vérification si l'utilisateur est déjà connecté
onMounted(() => {
  const token = localStorage.getItem('authToken')
  if (token) {
    router.push('/dashboard')
  }
})
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->

  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard
      class="auth-card pa-4 pt-7"
      max-width="500"
    >
      <VCardItem class="justify-center">
        <RouterLink
          to="/"
          class="d-flex align-center gap-1"
        >
          <VImg
            :src="logo"
            alt="Lafaom-MAO Logo"
            width="60"
            height="40"
            contain
          />
          <h2 class="font-weight-medium text-2xl ">
            Lafaom-MAO
          </h2>
        </RouterLink>
      </VCardItem>

      <VCardText class="pt-2">
        <h4 class="text-h4 mb-1">
          {{ $t('register.welcomeTitle') }}
        </h4>
        <p class="mb-0">
          {{ $t('register.welcomeSubtitle') }}
        </p>
      </VCardText>

      <VCardText>
        <VForm @submit.prevent="handleRegister">
          <VRow>
            <!-- Message d'erreur -->
            <VCol cols="12" v-if="error">
              <VAlert
                type="error"
                variant="tonal"
                closable
                @click:close="clearError"
                class="mb-4"
              >
                <template #prepend>
                  <VIcon icon="ri-error-warning-line" />
                </template>
                <div>
                  <div class="font-weight-medium mb-1">{{ $t('register.errorTitle') }}</div>
                  <div class="text-body-2">{{ error }}</div>
                </div>
              </VAlert>
            </VCol>

            <!-- Prénom -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.prenom"
                :label="$t('register.firstName')"
                :disabled="isLoading"
                :rules="[
                  v => !!v || $t('register.validation.firstNameRequired'),
                  v => v.length >= 2 || $t('register.validation.firstNameMinLength')
                ]"
                required
              />
            </VCol>

            <!-- Nom -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.nom"
                :label="$t('register.lastName')"
                :disabled="isLoading"
                :rules="[
                  v => !!v || $t('register.validation.lastNameRequired'),
                  v => v.length >= 2 || $t('register.validation.lastNameMinLength')
                ]"
                required
              />
            </VCol>

            <!-- Email -->
            <VCol cols="12">
              <VTextField
                v-model="form.email"
                :label="$t('register.email')"
                type="email"
                :disabled="isLoading"
                :rules="[
                  v => !!v || $t('register.validation.emailRequired'),
                  v => /.+@.+\..+/.test(v) || $t('register.validation.emailInvalid')
                ]"
                required
              />
            </VCol>

            <!-- Sexe -->
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.sexe"
                :label="$t('register.gender')"
                :items="sexeOptions"
                item-title="title"
                item-value="value"
                :disabled="isLoading"
                :rules="[
                  v => !!v || $t('register.validation.genderRequired')
                ]"
                required
              />
            </VCol>

            <!-- Rôle -->
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.role_name"
                :label="$t('register.roleInSystem')"
                :items="roleOptions"
                item-title="title"
                item-value="value"
                :disabled="isLoading"
                :rules="[
                  v => !!v || $t('register.validation.roleRequired')
                ]"
                required
              >
                <template #item="{ item, props }">
                  <VListItem v-bind="props">
                    <template #title>
                      <div class="font-weight-medium">{{ item.title }}</div>
                    </template>
                  </VListItem>
                </template>
              </VSelect>
            </VCol>

            <!-- Conditions -->
            <VCol cols="12">
              <VCheckbox
                :model-value="true"
                :label="$t('register.acceptTerms')"
                :disabled="isLoading"
                required
              />
            </VCol>

            <!-- Inscription button -->
            <VCol cols="12">
              <VBtn
                block
                type="submit"
                :loading="isLoading"
                :disabled="!isFormValid || isLoading"
                color="primary"
                size="large"
              >
                <VIcon
                  v-if="isLoading"
                  icon="ri-loader-4-line"
                  class="me-2"
                  start
                />
                {{ isLoading ? $t('register.signingUp') : $t('register.signUp') }}
              </VBtn>
            </VCol>

            <!-- Se connecter -->
            <VCol
              cols="12"
              class="text-center text-base"
            >
                              <span>{{ $t('register.alreadyHaveAccount') }}</span>
              <RouterLink
                class="text-primary ms-2"
                to="/login"
                :class="{ 'disabled': isLoading }"
              >
                {{ $t('register.login') }}
              </RouterLink>
            </VCol>

            
            <!-- auth providers -->
            <VCol
              cols="12"
              class="text-center"
            >
              <AuthProvider />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>

    <!-- bg img -->
    <VImg
      class="auth-footer-mask d-none d-md-block"
      :src="authThemeMask"
    />
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";

.disabled {
  opacity: 0.6;
  pointer-events: none;
}

// Animation pour les alertes d'erreur
.v-alert {
  animation: slideInDown 0.3s ease-out;
}

// @keyframes slideInDown {
//   from {
//     opacity: 0;
//     transform: translateY(-10px);
//   }

//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }

// Amélioration du style du bouton d'inscription
.v-btn--size-large {
  block-size: 48px;
  font-size: 1rem;
  font-weight: 500;
}

// Style pour les sélecteurs
.v-select {
  .v-field__input {
    min-block-size: 40px;
  }
}

// Style pour les items de sélection avec sous-titres
.v-list-item {
  .v-list-item-title {
    font-weight: 500;
  }

  .v-list-item-subtitle {
    font-size: 0.75rem;
    line-height: 1.2;
  }
}
</style>
