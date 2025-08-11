<script lang="ts" setup>
import { useUserProfile } from '@/composables/useUserProfile'
import avatar1 from '@images/avatars/avatar-1.png'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { user, isLoading, error, fetchUserProfile, updateUserProfile } = useUserProfile()

const refInputEl = ref<HTMLElement>()
const isAccountDeactivated = ref(false)

// Données du formulaire basées sur les données utilisateur
const accountDataLocal = ref({
  avatarImg: avatar1,
  firstName: '',
  lastName: '',
  email: '',
  org: '',
  phone: '',
  address: '',
  state: '',
  zip: '',
  country: '',
  language: 'Français',
  timezone: '(GMT+01:00) Paris',
  currency: 'EUR',
})

// Synchroniser les données utilisateur avec le formulaire
watch(user, (newUser) => {
  if (newUser) {
    accountDataLocal.value.firstName = newUser.prenom || ''
    accountDataLocal.value.lastName = newUser.nom || ''
    accountDataLocal.value.email = newUser.email || ''
    // Les autres champs peuvent être ajoutés selon les besoins
  }
}, { immediate: true })

// Charger les données utilisateur au montage
onMounted(async () => {
  await fetchUserProfile()
})

const resetForm = () => {
  if (user.value) {
    accountDataLocal.value.firstName = user.value.prenom || ''
    accountDataLocal.value.lastName = user.value.nom || ''
    accountDataLocal.value.email = user.value.email || ''
  }
}

// Fonction pour sauvegarder les modifications
const saveChanges = async () => {
  if (!user.value) return

  try {
    await updateUserProfile({
      prenom: accountDataLocal.value.firstName,
      nom: accountDataLocal.value.lastName,
      email: accountDataLocal.value.email,
    })
    // Optionnel: afficher un message de succès
  } catch (err) {
    // L'erreur est déjà gérée par le composable
    console.error('Erreur lors de la sauvegarde:', err)
  }
}

// changeAvatar function
const changeAvatar = (file: Event) => {
  const fileReader = new FileReader()
  const { files } = file.target as HTMLInputElement

  if (files && files.length) {
    fileReader.readAsDataURL(files[0])
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string')
        accountDataLocal.value.avatarImg = fileReader.result
    }
  }
}

// reset avatar image
const resetAvatar = () => {
  accountDataLocal.value.avatarImg = avatar1
}

const timezones = [
  '(GMT-11:00) International Date Line West',
  '(GMT-11:00) Midway Island',
  '(GMT-10:00) Hawaii',
  '(GMT-09:00) Alaska',
  '(GMT-08:00) Pacific Time (US & Canada)',
  '(GMT-08:00) Tijuana',
  '(GMT-07:00) Arizona',
  '(GMT-07:00) Chihuahua',
  '(GMT-07:00) La Paz',
  '(GMT-07:00) Mazatlan',
  '(GMT-07:00) Mountain Time (US & Canada)',
  '(GMT-06:00) Central America',
  '(GMT-06:00) Central Time (US & Canada)',
  '(GMT-06:00) Guadalajara',
  '(GMT-06:00) Mexico City',
  '(GMT-06:00) Monterrey',
  '(GMT-06:00) Saskatchewan',
  '(GMT-05:00) Bogota',
  '(GMT-05:00) Eastern Time (US & Canada)',
  '(GMT-05:00) Indiana (East)',
  '(GMT-05:00) Lima',
  '(GMT-05:00) Quito',
  '(GMT-04:00) Atlantic Time (Canada)',
  '(GMT-04:00) Caracas',
  '(GMT-04:00) La Paz',
  '(GMT-04:00) Santiago',
  '(GMT-03:30) Newfoundland',
  '(GMT-03:00) Brasilia',
  '(GMT-03:00) Buenos Aires',
  '(GMT-03:00) Georgetown',
  '(GMT-03:00) Greenland',
  '(GMT-02:00) Mid-Atlantic',
  '(GMT-01:00) Azores',
  '(GMT-01:00) Cape Verde Is.',
  '(GMT+00:00) Casablanca',
  '(GMT+00:00) Dublin',
  '(GMT+00:00) Edinburgh',
  '(GMT+00:00) Lisbon',
  '(GMT+00:00) London',
]

const currencies = [
  'USD',
  'EUR',
  'GBP',
  'AUD',
  'BRL',
  'CAD',
  'CNY',
  'CZK',
  'DKK',
  'HKD',
  'HUF',
  'INR',
]
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard :title="$t('account.details')">
        <VCardText class="d-flex">
          <!-- 👉 Avatar -->
          <VAvatar rounded="lg" size="100" class="me-6" :image="accountDataLocal.avatarImg" />

          <!-- 👉 Upload Photo -->
          <form class="d-flex flex-column justify-center gap-5">
            <div class="d-flex flex-wrap gap-2">
              <VBtn color="primary" @click="refInputEl?.click()">
                <VIcon icon="ri-upload-cloud-line" class="d-sm-none" />
                <span class="d-none d-sm-block">{{ $t('account.uploadPhoto') }}</span>
              </VBtn>

              <input ref="refInputEl" type="file" name="file" accept=".jpeg,.png,.jpg,GIF" hidden @input="changeAvatar">

              <VBtn type="reset" color="error" variant="outlined" @click="resetAvatar">
                <span class="d-none d-sm-block">{{ $t('account.reset') }}</span>
                <VIcon icon="ri-refresh-line" class="d-sm-none" />
              </VBtn>
            </div>

            <p class="text-body-1 mb-0">
              {{ $t('account.allowedFormats') }}
            </p>
          </form>
        </VCardText>

        <VDivider />

        <VCardText>
          <!-- 👉 Error Alert -->
          <VAlert v-if="error" type="error" variant="tonal" class="mb-4">
            {{ error }}
          </VAlert>

          <!-- 👉 Form -->
          <VForm class="mt-6">
            <VRow>
              <!-- 👉 First Name -->
              <VCol md="6" cols="12">
                <VTextField v-model="accountDataLocal.firstName" :placeholder="$t('account.placeholders.firstName')"
                  :label="$t('account.firstName')" :disabled="isLoading" />
              </VCol>

              <!-- 👉 Last Name -->
              <VCol md="6" cols="12">
                <VTextField v-model="accountDataLocal.lastName" :placeholder="$t('account.placeholders.lastName')"
                  :label="$t('account.lastName')" :disabled="isLoading" />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12" md="6">
                <VTextField v-model="accountDataLocal.email" :label="$t('account.email')"
                  :placeholder="$t('account.placeholders.email')" type="email" :disabled="isLoading" />
              </VCol>

              <!-- 👉 Organization -->
              <VCol cols="12" md="6">
                <VTextField v-model="accountDataLocal.org" :label="$t('account.organization')"
                  :placeholder="$t('account.placeholders.organization')" :disabled="isLoading" />
              </VCol>

              <!-- 👉 Phone -->
              <VCol cols="12" md="6">
                <VTextField v-model="accountDataLocal.phone" :label="$t('account.phone')"
                  :placeholder="$t('account.placeholders.phone')" :disabled="isLoading" />
              </VCol>

              <!-- 👉 Address -->
              <VCol cols="12" md="6">
                <VTextField v-model="accountDataLocal.address" :label="$t('account.address')"
                  :placeholder="$t('account.placeholders.address')" :disabled="isLoading" />
              </VCol>

              <!-- 👉 State -->
              <VCol cols="12" md="6">
                <VTextField v-model="accountDataLocal.state" :label="$t('account.state')"
                  :placeholder="$t('account.placeholders.state')" :disabled="isLoading" />
              </VCol>

              <!-- 👉 Zip Code -->
              <VCol cols="12" md="6">
                <VTextField v-model="accountDataLocal.zip" :label="$t('account.zipCode')"
                  :placeholder="$t('account.placeholders.zipCode')" :disabled="isLoading" />
              </VCol>

              <!-- 👉 Country -->
              <VCol cols="12" md="6">
                <VSelect v-model="accountDataLocal.country" :label="$t('account.country')"
                  :items="['France', 'Canada', 'Belgique', 'Suisse', 'Maroc']"
                  :placeholder="$t('account.placeholders.selectCountry')" :disabled="isLoading" />
              </VCol>

              <!-- 👉 Language -->
              <VCol cols="12" md="6">
                <VSelect v-model="accountDataLocal.language" :label="$t('account.language')"
                  :placeholder="$t('account.placeholders.selectLanguage')" :items="['Français', 'English', 'العربية']"
                  :disabled="isLoading" />
              </VCol>

              <!-- 👉 Timezone -->
              <VCol cols="12" md="6">
                <VSelect v-model="accountDataLocal.timezone" :label="$t('account.timezone')"
                  :placeholder="$t('account.placeholders.selectTimezone')" :items="timezones"
                  :menu-props="{ maxHeight: 200 }" :disabled="isLoading" />
              </VCol>

              <!-- 👉 Currency -->
              <VCol cols="12" md="6">
                <VSelect v-model="accountDataLocal.currency" :label="$t('account.currency')"
                  :placeholder="$t('account.placeholders.selectCurrency')" :items="currencies"
                  :menu-props="{ maxHeight: 200 }" :disabled="isLoading" />
              </VCol>

              <!-- 👉 Form Actions -->
              <VCol cols="12" class="d-flex flex-wrap gap-4">
                <VBtn :loading="isLoading" :disabled="isLoading" @click="saveChanges">
                  {{ $t('account.saveChanges') }}
                </VBtn>

                <VBtn color="secondary" variant="outlined" type="reset" :disabled="isLoading"
                  @click.prevent="resetForm">
                  {{ $t('account.reset') }}
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <!-- 👉 Deactivate Account -->
      <VCard :title="$t('account.deactivateTitle')">
        <VCardText>
          <div>
            <VCheckbox v-model="isAccountDeactivated" :label="$t('account.deactivateConfirm')" />
          </div>

          <VBtn :disabled="!isAccountDeactivated" color="error" class="mt-3">
            {{ $t('account.deactivate') }}
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
