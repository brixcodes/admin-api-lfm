<script lang="ts" setup>
import { useUserProfile } from '@/composables/useUserProfile'
import { AuthApi } from '@/utils/services'
import { useI18n } from 'vue-i18n'
import { useGlobalNotifications } from '@/composables/useNotifications'

const { t } = useI18n()
const { success: notifySuccess, error: notifyError } = useGlobalNotifications()
const { user, fetchUserProfile } = useUserProfile()

// Charger les données utilisateur au montage
onMounted(async () => {
  await fetchUserProfile()
})

const isCurrentPasswordVisible = ref(false)
const isNewPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// États pour la gestion du changement de mot de passe
const isChangingPassword = ref(false)
const passwordChangeError = ref<string | null>(null)
const passwordChangeSuccess = ref(false)

// Modal de confirmation
const confirmDialog = ref(false)
const confirming = ref(false)

const passwordRequirements = computed(() => [
  t('security.requirements.minLength'),
  t('security.requirements.lowercase'),
  t('security.requirements.numberOrSymbol'),
])

// Validation du formulaire de mot de passe
const isPasswordFormValid = computed(() => {
  return (
    currentPassword.value.length > 0 &&
    newPassword.value.length >= 8 &&
    confirmPassword.value === newPassword.value &&
    user.value?.id
  )
})

const openConfirm = () => {
  if (!isPasswordFormValid.value) return
  confirmDialog.value = true
}

// Fonction pour changer le mot de passe
const handlePasswordChange = async () => {
  if (!isPasswordFormValid.value || !user.value?.id) {
    passwordChangeError.value = t('security.currentPasswordRequired')
    return
  }

  isChangingPassword.value = true
  passwordChangeError.value = null
  passwordChangeSuccess.value = false

  try {
    const payload = {
      utilisateur_id: user.value.id,
      current_password: currentPassword.value,
      new_password: newPassword.value,
    }

    await AuthApi.changePassword(payload)

    // Succès - réinitialiser le formulaire
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    passwordChangeSuccess.value = true
    notifySuccess(t('security.changePasswordSuccess') as string)

    // Masquer le message de succès après 5 secondes
    setTimeout(() => {
      passwordChangeSuccess.value = false
    }, 5000)

  } catch (error: any) {
    // Gestion d'erreurs plus détaillée
    if (error?.response?.status === 422) {
      const errorData = error.response?.data
      if (errorData?.detail) {
        if (Array.isArray(errorData.detail)) {
          passwordChangeError.value = errorData.detail.map((err: any) => err.msg).join(', ')
        } else {
          passwordChangeError.value = errorData.detail
        }
      } else if (errorData?.message) {
        passwordChangeError.value = errorData.message
      } else {
        passwordChangeError.value = t('security.invalidCredentials') as string
      }
    } else if (error?.response?.status === 401) {
      passwordChangeError.value = t('security.wrongCurrentPassword') as string
    } else {
      passwordChangeError.value = (error?.message || t('security.changePasswordError')) as string
    }
    notifyError(t('security.changePasswordError') as string, passwordChangeError.value || undefined)
  } finally {
    isChangingPassword.value = false
  }
}

// Confirmer la soumission après modal
const confirmSubmit = async () => {
  confirming.value = true
  try {
    await handlePasswordChange()
    confirmDialog.value = false
  } finally {
    confirming.value = false
  }
}

// Fonction pour réinitialiser le formulaire
const resetPasswordForm = () => {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  passwordChangeError.value = null
  passwordChangeSuccess.value = false
}
</script>

<template>
  <VRow>
    <!-- SECTION: Change Password -->
    <VCol cols="12">
      <VCard :title="$t('security.changePassword')">
        <VForm @submit.prevent="openConfirm">
          <VCardText>
            <!-- 👉 Success Alert -->
            <VAlert v-if="passwordChangeSuccess" type="success" variant="tonal" class="mb-4">
              {{ $t('security.changePasswordSuccess') }}
            </VAlert>

            <!-- 👉 Error Alert -->
            <VAlert v-if="passwordChangeError" type="error" variant="tonal" class="mb-4">
              {{ passwordChangeError }}
            </VAlert>
            <!-- 👉 Current Password -->
            <VRow class="mb-3">
              <VCol cols="12" md="6">
                <!-- 👉 current password -->
                <VTextField v-model="currentPassword" :type="isCurrentPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isCurrentPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'" autocomplete="on"
                  :label="$t('security.currentPassword')" placeholder="············" :disabled="isChangingPassword"
                  :rules="[
                    v => !!v || $t('security.currentPasswordRequired')
                  ]" required @click:append-inner="isCurrentPasswordVisible = !isCurrentPasswordVisible" />
              </VCol>
            </VRow>

            <!-- 👉 New Password -->
            <VRow>
              <VCol cols="12" md="6">
                <!-- 👉 new password -->
                <VTextField v-model="newPassword" :type="isNewPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isNewPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                  prepend-inner-icon="ri-lock-2-line" :label="$t('security.newPassword')" autocomplete="on"
                  placeholder="············" :disabled="isChangingPassword" :rules="[
                    v => !!v || $t('security.newPasswordRequired'),
                    v => (v && v.length >= 8) || $t('security.requirements.minLength'),
                    v => /[a-z]/.test(v || '') || $t('security.requirements.lowercase'),
                    v => /(\d|\W|\s)/.test(v || '') || $t('security.requirements.numberOrSymbol')
                  ]" required @click:append-inner="isNewPasswordVisible = !isNewPasswordVisible" />
              </VCol>

              <VCol cols="12" md="6">
                <!-- 👉 confirm password -->
                <VTextField v-model="confirmPassword" :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isConfirmPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'" autocomplete="on"
                  prepend-inner-icon="ri-lock-2-line" :label="$t('security.confirmPassword')" placeholder="············"
                  :disabled="isChangingPassword" :rules="[
                    v => !!v || $t('security.newPasswordRequired'),
                    v => (v && v.length >= 8) || $t('security.requirements.minLength'),
                    v => /[a-z]/.test(v || '') || $t('security.requirements.lowercase'),
                    v => /(\d|\W|\s)/.test(v || '') || $t('security.requirements.numberOrSymbol'),
                    v => v === newPassword || $t('security.passwordMismatch')
                  ]" required @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible" />
              </VCol>
            </VRow>
          </VCardText>

          <!-- 👉 Password Requirements -->
          <VCardText>
            <p class="text-base font-weight-medium mt-2">
              {{ $t('security.passwordRequirements') }}
            </p>

            <ul class="d-flex flex-column gap-y-3">
              <li v-for="item in passwordRequirements" :key="item" class="d-flex">
                <div>
                  <VIcon size="7" icon="ri-checkbox-blank-circle-fill" class="me-3" />
                </div>
                <span class="font-weight-medium">{{ item }}</span>
              </li>
            </ul>
          </VCardText>

          <!-- 👉 Action Buttons -->
          <VCardText class="d-flex flex-wrap gap-4">
            <VBtn type="submit" :loading="isChangingPassword" :disabled="!isPasswordFormValid || isChangingPassword">
              {{ isChangingPassword ? $t('common.loading') : $t('account.saveChanges') }}
            </VBtn>

            <VBtn type="reset" color="secondary" variant="outlined" :disabled="isChangingPassword"
              @click="resetPasswordForm">
              {{ $t('account.reset') }}
            </VBtn>
          </VCardText>
        </VForm>
      </VCard>
    </VCol>
    <!-- !SECTION -->
  </VRow>

  <!-- Modal de confirmation -->
  <VDialog v-model="confirmDialog" max-width="520" persistent>
    <VCard>
      <VCardTitle class="text-h6">
        {{ $t('security.confirm.title') }}
      </VCardTitle>
      <VCardText>
        {{ $t('security.confirm.message') }}
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="outlined" color="secondary" @click="confirmDialog = false">{{ $t('common.cancel') }}</VBtn>
        <VBtn color="primary" :loading="confirming" @click="confirmSubmit">{{ $t('common.confirm') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
