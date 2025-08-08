<script lang="ts" setup>
import { useUserProfile } from '@/composables/useUserProfile'
import { AuthApi } from '@/utils/services'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
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

    console.log('Sending password change request for user ID:', user.value.id)

    await AuthApi.changePassword(payload)

    // Succès - réinitialiser le formulaire
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    passwordChangeSuccess.value = true

    // Masquer le message de succès après 5 secondes
    setTimeout(() => {
      passwordChangeSuccess.value = false
    }, 5000)

  } catch (error: any) {
    console.error('Password change error:', error)

    // Gestion d'erreurs plus détaillée
    if (error.response?.status === 422) {
      const errorData = error.response?.data
      if (errorData?.detail) {
        // Si l'API renvoie des détails d'erreur
        if (Array.isArray(errorData.detail)) {
          passwordChangeError.value = errorData.detail.map((err: any) => err.msg).join(', ')
        } else {
          passwordChangeError.value = errorData.detail
        }
      } else if (errorData?.message) {
        passwordChangeError.value = errorData.message
      } else {
        passwordChangeError.value = t('security.invalidCredentials')
      }
    } else if (error.response?.status === 401) {
      passwordChangeError.value = t('security.wrongCurrentPassword')
    } else {
      passwordChangeError.value = error.message || t('security.changePasswordError')
    }
  } finally {
    isChangingPassword.value = false
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

const serverKeys = [
  {
    name: 'Server Key 1',
    key: '23eaf7f0-f4f7-495e-8b86-fad3261282ac',
    createdOn: '28 Apr 2021, 18:20 GTM+4:10',
    permission: 'Full Access',
  },
  {
    name: 'Server Key 2',
    key: 'bb98e571-a2e2-4de8-90a9-2e231b5e99',
    createdOn: '12 Feb 2021, 10:30 GTM+2:30',
    permission: 'Read Only',
  },
  {
    name: 'Server Key 3',
    key: '2e915e59-3105-47f2-8838-6e46bf83b711',
    createdOn: '28 Dec 2020, 12:21 GTM+4:10',
    permission: 'Full Access',
  },
]

const recentDevicesHeaders = computed(() => [
  { title: t('security.browser').toUpperCase(), key: 'browser' },
  { title: t('security.device').toUpperCase(), key: 'device' },
  { title: t('security.location').toUpperCase(), key: 'location' },
  { title: t('security.recentActivity').toUpperCase(), key: 'recentActivity' },
])

const recentDevices = [
  {
    browser: 'Chrome on Windows',
    device: 'HP Spectre 360',
    location: 'New York, NY',
    recentActivity: '28 Apr 2022, 18:20',
    deviceIcon: { icon: 'ri-macbook-line', color: 'primary' },
  },
  {
    browser: 'Chrome on iPhone',
    device: 'iPhone 12x',
    location: 'Los Angeles, CA',
    recentActivity: '20 Apr 2022, 10:20',
    deviceIcon: { icon: 'ri-android-line', color: 'error' },
  },
  {
    browser: 'Chrome on Android',
    device: 'Oneplus 9 Pro',
    location: 'San Francisco, CA',
    recentActivity: '16 Apr 2022, 04:20',
    deviceIcon: { icon: 'ri-smartphone-line', color: 'success' },
  },
  {
    browser: 'Chrome on macOS',
    device: 'Apple iMac',
    location: 'New York, NY',
    recentActivity: '28 Apr 2022, 18:20',
    deviceIcon: { icon: 'ri-mac-line', color: 'secondary' },
  },
  {
    browser: 'Chrome on Windows',
    device: 'HP Spectre 360',
    location: 'Los Angeles, CA',
    recentActivity: '20 Apr 2022, 10:20',
    deviceIcon: { icon: 'ri-macbook-line', color: 'primary' },
  },
  {
    browser: 'Chrome on Android',
    device: 'Oneplus 9 Pro',
    location: 'San Francisco, CA',
    recentActivity: '16 Apr 2022, 04:20',
    deviceIcon: { icon: 'ri-android-line', color: 'success' },
  },
]
</script>

<template>
  <VRow>
    <!-- SECTION: Change Password -->
    <VCol cols="12">
      <VCard :title="$t('security.changePassword')">
        <VForm @submit.prevent="handlePasswordChange">
          <VCardText>
            <!-- 👉 Success Alert -->
            <VAlert
              v-if="passwordChangeSuccess"
              type="success"
              variant="tonal"
              class="mb-4"
            >
              {{ $t('security.changePasswordSuccess') }}
            </VAlert>

            <!-- 👉 Error Alert -->
            <VAlert
              v-if="passwordChangeError"
              type="error"
              variant="tonal"
              class="mb-4"
            >
              {{ passwordChangeError }}
            </VAlert>
            <!-- 👉 Current Password -->
            <VRow class="mb-3">
              <VCol
                cols="12"
                md="6"
              >
                <!-- 👉 current password -->
                <VTextField
                  v-model="currentPassword"
                  :type="isCurrentPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isCurrentPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                  autocomplete="on"
                  :label="$t('security.currentPassword')"
                  placeholder="············"
                  :disabled="isChangingPassword"
                  :rules="[
                    v => !!v || $t('security.currentPasswordRequired')
                  ]"
                  required
                  @click:append-inner="isCurrentPasswordVisible = !isCurrentPasswordVisible"
                />
              </VCol>
            </VRow>

            <!-- 👉 New Password -->
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <!-- 👉 new password -->
                <VTextField
                  v-model="newPassword"
                  :type="isNewPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isNewPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                  :label="$t('security.newPassword')"
                  autocomplete="on"
                  placeholder="············"
                  :disabled="isChangingPassword"
                  :rules="[
                    v => !!v || $t('security.newPasswordRequired'),
                    v => v.length >= 8 || $t('security.requirements.minLength')
                  ]"
                  required
                  @click:append-inner="isNewPasswordVisible = !isNewPasswordVisible"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <!-- 👉 confirm password -->
                <VTextField
                  v-model="confirmPassword"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isConfirmPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                  autocomplete="on"
                  :label="$t('security.confirmPassword')"
                  placeholder="············"
                  :disabled="isChangingPassword"
                  :rules="[
                    v => !!v || $t('security.newPasswordRequired'),
                    v => v === newPassword || $t('security.passwordMismatch')
                  ]"
                  required
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                />
              </VCol>
            </VRow>
          </VCardText>

          <!-- 👉 Password Requirements -->
          <VCardText>
            <p class="text-base font-weight-medium mt-2">
              {{ $t('security.passwordRequirements') }}
            </p>

            <ul class="d-flex flex-column gap-y-3">
              <li
                v-for="item in passwordRequirements"
                :key="item"
                class="d-flex"
              >
                <div>
                  <VIcon
                    size="7"
                    icon="ri-checkbox-blank-circle-fill"
                    class="me-3"
                  />
                </div>
                <span class="font-weight-medium">{{ item }}</span>
              </li>
            </ul>
          </VCardText>

          <!-- 👉 Action Buttons -->
          <VCardText class="d-flex flex-wrap gap-4">
            <VBtn
              type="submit"
              :loading="isChangingPassword"
              :disabled="!isPasswordFormValid || isChangingPassword"
            >
              {{ isChangingPassword ? $t('common.loading') : $t('account.saveChanges') }}
            </VBtn>

            <VBtn
              type="reset"
              color="secondary"
              variant="outlined"
              :disabled="isChangingPassword"
              @click="resetPasswordForm"
            >
              {{ $t('account.reset') }}
            </VBtn>
          </VCardText>
        </VForm>
      </VCard>
    </VCol>
    <!-- !SECTION -->

    <!-- SECTION Two-steps verification -->
    <VCol cols="12">
      <VCard :title="$t('security.twoFactorAuth')">
        <VCardText>
          <p class="font-weight-semibold">
            {{ $t('security.twoFactorNotEnabled') }}
          </p>
          <p>
            {{ $t('security.twoFactorDescription') }}
            <a
              href="javascript:void(0)"
              class="text-decoration-none"
            >{{ $t('account.learnMore') }}.</a>
          </p>

          <VBtn>
            {{ $t('security.enableTwoFactor') }}
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
    <!-- !SECTION -->

    <VCol cols="12">
      <!-- SECTION: Create an API key -->
      <VCard :title="$t('security.createApiKey')">
        <VRow>
          <!-- 👉 Choose API Key -->
          <VCol
            cols="12"
            md="5"
            order-md="0"
            order="1"
          >
            <VCardText>
              <VForm @submit.prevent="() => {}">
                <VRow>
                  <!-- 👉 Choose API Key -->
                  <VCol cols="12">
                    <VSelect
                      :label="$t('security.chooseApiKeyType')"
                      :placeholder="$t('security.selectApiKeyType')"
                      :items="['Full Control', 'Modify', 'Read & Execute', 'List Folder Contents', 'Read Only', 'Read & Write']"
                    />
                  </VCol>

                  <!-- 👉 Name the API Key -->
                  <VCol cols="12">
                    <VTextField
                      :label="$t('security.nameApiKey')"
                      :placeholder="$t('security.nameApiKey')"
                    />
                  </VCol>

                  <!-- 👉 Create Key Button -->
                  <VCol cols="12">
                    <VBtn
                      type="submit"
                      block
                    >
                      {{ $t('security.createKey') }}
                    </VBtn>
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>
          </VCol>
        </VRow>
      </VCard>
    <!-- !SECTION -->
    </VCol>

    <VCol cols="12">
      <!-- SECTION: API Keys List -->
      <VCard title="API Key List &amp; Access">
        <VCardText>
          An API key is a simple encrypted string that identifies an application without any principal. They are useful for accessing public data anonymously, and are used to associate API requests with your project for quota and billing.
        </VCardText>

        <!-- 👉 Server Status -->
        <VCardText class="d-flex flex-column gap-y-4">
          <div
            v-for="serverKey in serverKeys"
            :key="serverKey.key"
            class="bg-var-theme-background pa-4"
          >
            <div class="d-flex align-center flex-wrap mb-3">
              <h6 class="text-h6 mb-0 me-3">
                {{ serverKey.name }}
              </h6>
              <VChip
                color="primary"
                size="small"
              >
                {{ serverKey.permission }}
              </VChip>
            </div>
            <p class="text-base font-weight-medium">
              <span class="me-3">{{ serverKey.key }}</span>
              <VIcon
                :size="18"
                icon="ri-file-copy-line"
                class="cursor-pointer"
              />
            </p>
            <span>Created on {{ serverKey.createdOn }}</span>
          </div>
        </VCardText>
      </VCard>
      <!-- !SECTION -->
    </VCol>

    <!-- SECTION Recent Devices -->
    <VCol cols="12">
      <!-- 👉 Table -->
      <VCard title="Recent Devices">
        <VDataTable
          :headers="recentDevicesHeaders"
          :items="recentDevices"
          hide-default-footer
          class="text-no-wrap"
        >
          <template #item.browser="{ item }">
            <div class="d-flex">
              <VIcon
                start
                :icon="item.deviceIcon.icon"
                :color="item.deviceIcon.color"
              />
              <span>
                {{ item.browser }}
              </span>
            </div>
          </template>
          <!-- TODO Refactor this after vuetify provides proper solution for removing default footer -->
          <template #bottom />
        </VDataTable>
      </VCard>
    </VCol>
    <!-- !SECTION -->
  </VRow>
</template>
