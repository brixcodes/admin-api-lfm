<script setup lang="ts">
import { useTheme } from 'vuetify'
import { useRouter } from 'vue-router'
import { useAuth } from '@/utils/auth'
import { getRedirectAfterLogin } from '@/utils/authGuard'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'

const logo = '/logo_lafaom.png'
import authV1MaskDark from '@images/pages/auth-v1-mask-dark.png'
import authV1MaskLight from '@images/pages/auth-v1-mask-light.png'
import authV1Tree2 from '@images/pages/auth-v1-tree-2.png'
import authV1Tree from '@images/pages/auth-v1-tree.png'

const router = useRouter()
const { login, isLoading, error, clearError } = useAuth()

const form = ref({
  email: '',
  password: '',
  remember: false,
})

const vuetifyTheme = useTheme()

const authThemeMask = computed(() => {
  return vuetifyTheme.global.name.value === 'light'
    ? authV1MaskLight
    : authV1MaskDark
})

const isPasswordVisible = ref(false)

// Validation du formulaire
const isFormValid = computed(() => {
  return form.value.email && form.value.password && form.value.email.includes('@')
})

// Fonction de connexion
const handleLogin = async () => {
  if (!isFormValid.value) {
    return
  }

  // Effacer les erreurs précédentes seulement lors d'une nouvelle tentative
  clearError()

  try {
    await login({
      email: form.value.email,
      password: form.value.password,
    })
    
    // Gestion de "Se souvenir de moi"
    if (form.value.remember) {
      localStorage.setItem('rememberMe', 'true')
    }
    
    // Redirection vers la route demandée ou le tableau de bord
    const redirectPath = getRedirectAfterLogin()
    router.push(redirectPath)
  } catch (err) {
    // L'erreur est déjà gérée par le service d'authentification
    console.error('Erreur de connexion:', err)
  }
}

// Vérification si l'utilisateur est déjà connecté
onMounted(() => {
  const token = localStorage.getItem('authToken')
  if (token) {
    const redirectPath = getRedirectAfterLogin()
    router.push(redirectPath)
  }
})
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->

  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard
      class="auth-card pa-4 pt-7"
      max-width="448"
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

      <VCardText class="pt-2 text-center">
        <p class="mb-0">
          Institut de formation et d'intervention sociale dans l'univers carcéral
        </p>
      </VCardText>

      <VCardText>
        <VForm @submit.prevent="handleLogin">
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
                  <div class="font-weight-medium mb-1">Erreur de connexion</div>
                  <div class="text-body-2">{{ error }}</div>
                </div>
              </VAlert>
            </VCol>

            <!-- email -->
            <VCol cols="12">
              <VTextField
                v-model="form.email"
                label="Adresse email"
                type="email"
                :disabled="isLoading"
                :rules="[
                  v => !!v || 'L\'email est requis',
                  v => /.+@.+\..+/.test(v) || 'Format d\'email invalide'
                ]"
                required
              />
            </VCol>

            <!-- password -->
            <VCol cols="12">
              <VTextField
                v-model="form.password"
                label="Mot de passe"
                placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                autocomplete="current-password"
                :disabled="isLoading"
                :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                :rules="[
                  v => !!v || 'Le mot de passe est requis',
                  v => v.length >= 6 || 'Le mot de passe doit contenir au moins 6 caractères'
                ]"
                required
              />

              <!-- remember me checkbox -->
              <div class="d-flex align-center justify-space-between flex-wrap my-6">
                <VCheckbox
                  v-model="form.remember"
                  label="Se souvenir de moi"
                  :disabled="isLoading"
                />

                <RouterLink
                  class="text-primary"
                  to="/forgot-password"
                  :class="{ 'disabled': isLoading }"
                >
                  Mot de passe oublié?
                </RouterLink>
              </div>

              <!-- login button -->
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
                {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
              </VBtn>
            </VCol>

            <!-- create account -->
            <VCol
              cols="12"
              class="text-center text-base"
            >
              <span>Nouveau sur notre plateforme?</span>
              <RouterLink
                class="text-primary ms-2"
                to="/register"
                :class="{ 'disabled': isLoading }"
              >
                Créer un compte
              </RouterLink>
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

// Animation pour les alertes d'erreur
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

// Amélioration du style du bouton de connexion
.v-btn--size-large {
  height: 48px;
  font-size: 1rem;
  font-weight: 500;
}
</style>
