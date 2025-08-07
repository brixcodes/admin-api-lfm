<script setup lang="ts">
import { useAuth } from '@/utils/auth'
import authV1MaskDark from '@images/pages/auth-v1-mask-dark.png'
import authV1MaskLight from '@images/pages/auth-v1-mask-light.png'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

const logo = '/logo_lafaom.png'

const router = useRouter()
const { forgotPassword, isLoading, error, clearError, success } = useAuth()

const form = ref({
  email: '',
})

const vuetifyTheme = useTheme()

const authThemeMask = computed(() => {
  return vuetifyTheme.global.name.value === 'light'
    ? authV1MaskLight
    : authV1MaskDark
})

// Validation du formulaire
const isFormValid = computed(() => {
  return form.value.email.includes('@')
})

// Fonction de réinitialisation
const handleForgotPassword = async () => {
  if (!isFormValid.value) {
    return
  }

  // Effacer les erreurs précédentes
  clearError()

  try {
    await forgotPassword({
      email: form.value.email.trim(),
    })
    
    // Le message de succès sera affiché automatiquement
    // Optionnel : redirection après quelques secondes
    setTimeout(() => {
      router.push('/login')
    }, 3000)
    
  } catch (err) {
    // L'erreur est déjà gérée par le service d'authentification
    console.error('Erreur de réinitialisation:', err)
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

      <VCardText class="pt-2  text-center">
        <h4 class="text-h4 mb-1">
          Mot de passe oublié? 🔐
        </h4>
        <p class="mb-0">
          Entrez votre adresse email et nous vous enverrons les instructions pour réinitialiser votre mot de passe
        </p>
      </VCardText>

      <VCardText>
        <VForm @submit.prevent="handleForgotPassword">
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
                  <div class="font-weight-medium mb-1">Erreur de réinitialisation</div>
                  <div class="text-body-2">{{ error }}</div>
                </div>
              </VAlert>
            </VCol>

            <!-- Message de succès -->
            <VCol cols="12" v-if="success">
              <VAlert
                type="success"
                variant="tonal"
                closable
                @click:close="clearError"
                class="mb-4"
              >
                <template #prepend>
                  <VIcon icon="ri-check-line" />
                </template>
                <div>
                  <div class="font-weight-medium mb-1">Email envoyé avec succès!</div>
                  <div class="text-body-2">{{ success }}</div>
                  <div class="text-caption mt-2">
                    Vous allez être redirigé vers la page de connexion dans quelques secondes...
                  </div>
                </div>
              </VAlert>
            </VCol>

            <!-- Email -->
            <VCol cols="12">
              <VTextField
                v-model="form.email"
                label="Adresse email"
                type="email"
                placeholder="Entrez votre adresse email"
                :disabled="isLoading"
                :rules="[
                  v => !!v || 'L\'email est requis',
                  v => /.+@.+\..+/.test(v) || 'Format d\'email invalide'
                ]"
                required
              />
            </VCol>

            <!-- Bouton d'envoi -->
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
                {{ isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation' }}
              </VBtn>
            </VCol>

            <!-- Retour à la connexion -->
            <VCol
              cols="12"
              class="text-center text-base"
            >
              <RouterLink
                class="text-primary d-flex align-center justify-center gap-2"
                to="/login"
                :class="{ 'disabled': isLoading }"
              >
                <VIcon icon="ri-arrow-left-line" size="small" />
                Retour à la connexion
              </RouterLink>
            </VCol>

            <VCol
              cols="12"
              class="d-flex align-center"
            >
              
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
  pointer-events: none;
  opacity: 0.6;
}

// Animation pour les alertes d'erreur et de succès
.v-alert {
  animation: slideInDown 0.3s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Amélioration du style du bouton
.v-btn--size-large {
  height: 48px;
  font-size: 1rem;
  font-weight: 500;
}

// Style pour le lien de retour
.text-primary {
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
}
</style> 
