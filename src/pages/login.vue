<script setup lang="ts">
// Imports
import { useAuth } from '@/utils/auth'
import { getRedirectAfterLogin } from '@/utils/authGuard'
import authV1MaskDark from '@images/pages/auth-v1-mask-dark.png'
import authV1MaskLight from '@images/pages/auth-v1-mask-light.png'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

// Constants and refs
const logo = '/logo_lafaom.png'
const router = useRouter()
const { login, isLoading, error, clearError } = useAuth()
const vuetifyTheme = useTheme()
const isPasswordVisible = ref(false)

const form = ref({
  email: '',
  password: '',
  remember: false,
})

// Computed properties
const authThemeMask = computed(() => {
  return vuetifyTheme.global.name.value === 'light' ? authV1MaskLight : authV1MaskDark
})

const isFormValid = computed(() => {
  return form.value.email && form.value.password && form.value.email.includes('@')
})

// Methods
const handleLogin = async () => {
  if (!isFormValid.value) return

  clearError()

  try {
    await login({
      email: form.value.email,
      password: form.value.password,
    })
    
    if (form.value.remember) {
      localStorage.setItem('rememberMe', 'true')
    }
    
    router.push('/dashboard')
  } catch (err) {
    console.error('Erreur de connexion:', err)
  }
}

// Lifecycle hooks
onMounted(() => {
  const token = localStorage.getItem('authToken')
  if (token) {
    router.push(getRedirectAfterLogin())
  }
})
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <!-- Login Card -->
    <VCard class="auth-card pa-4 pt-7" max-width="448">
      <!-- Header -->
      <VCardItem class="justify-center">
        <RouterLink to="/" class="d-flex align-center gap-1">
          <VImg :src="logo" :alt="$t('login.title') + ' Logo'" width="60" height="40" contain />
          <h2 class="font-weight-medium text-2xl">{{$t('login.title')}}</h2>
        </RouterLink>
      </VCardItem>

      <!-- Subtitle -->
      <VCardText class="pt-2 text-center">
        <p class="mb-0">{{$t('login.subtitle')}}</p>
      </VCardText>

      <!-- Login Form -->
      <VCardText>
        <VForm @submit.prevent="handleLogin">
          <VRow>
            <!-- Error Alert -->
            <VCol cols="12" v-if="error">
              <VAlert type="error" variant="tonal" closable @click:close="clearError" class="mb-4">
                <template #prepend>
                  <VIcon icon="ri-error-warning-line" />
                </template>
                <div>
                  <div class="font-weight-medium mb-1">{{$t('login.errorTitle')}}</div>
                  <div class="text-body-2">{{ error }}</div>
                </div>
              </VAlert>
            </VCol>

            <!-- Email Field -->
            <VCol cols="12">
              <VTextField
                v-model="form.email"
                :label="$t('login.email')"
                type="email"
                :disabled="isLoading"
                :rules="[
                  v => !!v || 'L\'email est requis',
                  v => /.+@.+\..+/.test(v) || 'Format d\'email invalide'
                ]"
                required
              />
            </VCol>

            <!-- Password Field -->
            <VCol cols="12">
              <VTextField
                v-model="form.password"
                :label="$t('login.password')"
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

              <!-- Remember Me & Forgot Password -->
              <div class="d-flex align-center justify-space-between flex-wrap my-6">
                <VCheckbox v-model="form.remember" :label="$t('login.remember')" :disabled="isLoading" />
                <RouterLink class="text-primary" to="/forgot-password" :class="{ 'disabled': isLoading }">
                  {{$t('login.forgot')}}
                </RouterLink>
              </div>

              <!-- Login Button -->
              <VBtn
                block
                type="submit"
                :loading="isLoading"
                :disabled="!isFormValid || isLoading"
                color="primary"
                size="large"
              >
                <VIcon v-if="isLoading" icon="ri-loader-4-line" class="me-2" start />
                {{ isLoading ? $t('login.loading') : $t('login.login') }}
              </VBtn>
            </VCol>

            <!-- Register Link -->
            <VCol cols="12" class="text-center text-base">
              <span>{{$t('login.newHere')}}</span>
              <RouterLink class="text-primary ms-2" to="/register" :class="{ 'disabled': isLoading }">
                {{$t('login.createAccount')}}
              </RouterLink>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>

    <!-- Background Image -->
    <VImg class="auth-footer-mask d-none d-md-block" :src="authThemeMask" />
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";

.disabled {
  opacity: 0.6;
  pointer-events: none;
}

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

.v-btn--size-large {
  block-size: 48px;
  font-size: 1rem;
  font-weight: 500;
}
</style>
