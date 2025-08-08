<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard class="auth-card pa-4 pt-7" max-width="448">
      <VCardItem class="justify-center">
        <RouterLink to="/" class="d-flex align-center gap-1 mb-2">
          <VImg
            src="/logo_lafaom.png"
            alt="Lafaom-MAO Logo"
            width="60"
            height="40"
            contain
          />
          <h2 class="font-weight-medium text-2xl ">Lafaom-MAO</h2>
        </RouterLink>
      
      </VCardItem>
       <VCardText class="pt-2">
        <h4 class="text-h4 mb-1">
         Changer le mot de passe   </h4>
         <p class="mb-0">
          Entrez votre nouveau mot de passe et nous vous enverrons les instructions pour réinitialiser votre mot de passe
        </p>
      </VCardText>
      <VCardText>
        
        <VForm @submit.prevent="handleChangePassword" ref="formRef">
          <VTextField
            v-model="form.newPassword"
            :type="isNewPasswordVisible ? 'text' : 'password'"
            :append-inner-icon="isNewPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
            @click:append-inner="isNewPasswordVisible = !isNewPasswordVisible"
            label="Nouveau mot de passe"
            required
            class="mb-3"
          />
          <div v-if="form.newPassword.length > 0 && passwordRules.length > 0" class="text-error text-caption mb-3">
            <ul class="pl-4 mb-0">
              <li v-for="rule in passwordRules" :key="rule">{{ rule }}</li>
            </ul>
          </div>
          <VTextField
            v-model="form.confirmPassword"
            :type="isConfirmPasswordVisible ? 'text' : 'password'"
            :append-inner-icon="isConfirmPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
            @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
            label="Confirmer le nouveau mot de passe"
            required
            class="mb-3"
          />
          <div v-if="form.confirmPassword.length > 0 && confirmPasswordError" class="text-error text-caption mb-3">
            {{ confirmPasswordError }}
          </div>
          <VAlert v-if="localError" type="error" class="mb-4">{{ localError }}</VAlert>
          <VAlert v-if="localSuccess" type="success" class="mb-4">{{ localSuccess }}</VAlert>
          <VBtn :loading="isLoading" type="submit" color="primary" block>Valider</VBtn>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/utils/auth'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { isLoading, clearError } = useAuth()
const localError = ref('')
const localSuccess = ref('')

const formRef = ref()
const form = ref({
  newPassword: '',
  confirmPassword: '',
})

const isNewPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

const minLength = 8
const passwordRules = computed(() => {
  const pwd = form.value.newPassword
  const confirm = form.value.confirmPassword
  const errors = []
  if (pwd.length > 0 && pwd.length < minLength) errors.push(`Au moins ${minLength} caractères`)
  if (pwd.length > 0 && !/[a-zA-Z]/.test(pwd)) errors.push('Au moins une lettre')
  if (pwd.length > 0 && !/[0-9]/.test(pwd)) errors.push('Au moins un chiffre')
  return errors
})
const confirmPasswordError = computed(() => {
  if (form.value.confirmPassword.length > 0 && form.value.confirmPassword !== form.value.newPassword) {
    return 'Les mots de passe ne correspondent pas.'
  }
  return ''
})

const handleChangePassword = async () => {
  clearError()
  if (!form.value.newPassword || !form.value.confirmPassword) {
    localError.value = 'Tous les champs sont obligatoires.'
    return
  }
  if (passwordRules.value.length > 0) {
    localError.value = 'Le mot de passe ne respecte pas les critères.'
    return
  }
  if (confirmPasswordError.value) {
    localError.value = confirmPasswordError.value
    return
  }
  try {
    // Appel à l'API pour changer le mot de passe
    const body = {
      utilisateur_id: JSON.parse(localStorage.getItem('userInfo') || '{}').id,
      new_password: form.value.newPassword,
    }
    const response = await fetch('http://localhost:8000/users/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || 'Erreur lors du changement de mot de passe')
    }
    localSuccess.value = 'Mot de passe changé avec succès. Vous allez être redirigé.'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err: any) {
    localError.value = err.message || 'Erreur inconnue.'
  }
}
</script>

<style scoped>
.auth-wrapper {
  background: #f5f6fa;
  min-block-size: 100vh;
}
</style>
