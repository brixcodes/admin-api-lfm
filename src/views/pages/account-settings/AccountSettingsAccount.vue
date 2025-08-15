<script lang="ts" setup>
import { useUserProfile } from '@/composables/useUserProfile'
import avatar1 from '@images/avatars/avatar-1.png'
import { useI18n } from 'vue-i18n'
import { useGlobalNotifications } from '@/composables/useNotifications'
import { filesApi } from '@/services/api'
import countries from 'world-countries'

const { t } = useI18n()
const { success: notifySuccess, error: notifyError } = useGlobalNotifications()
const { user, isLoading, error, fetchUserProfile, updateUserProfile } = useUserProfile()
const isSaving = ref(false)
const formRef = ref()
const saveError = ref<string | null>(null)
const isChangingStatus = ref(false)
const actionSuccess = ref<string | null>(null)
const statusConfirmDialog = ref(false)
const statusConfirming = ref(false)
const statusAction = ref<'deactivate' | 'activate'>('deactivate')
const uploadingAvatar = ref(false)

const refInputEl = ref<HTMLElement>()
const isAccountDeactivated = ref(false)

// Données du formulaire basées sur les données utilisateur
const accountDataLocal = ref({
  avatarImg: avatar1,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  country: '',
  nationality: '',
  region: '',
  city: '',
  gender: '',
  birthDate: '',
})

// Helper clé de stockage avatar local
const getAvatarStorageKey = (id: number) => `user_avatar_url_${id}`

// Synchroniser les données utilisateur avec le formulaire
watch(user, (newUser) => {
  if (newUser) {
    accountDataLocal.value.firstName = newUser.prenom || ''
    accountDataLocal.value.lastName = newUser.nom || ''
    accountDataLocal.value.email = newUser.email || ''
    accountDataLocal.value.phone = newUser.telephone || ''
    accountDataLocal.value.nationality = newUser.nationalite || ''
    accountDataLocal.value.country = newUser.pays || ''
    accountDataLocal.value.region = newUser.region || ''
    accountDataLocal.value.city = newUser.ville || ''
    accountDataLocal.value.address = newUser.adresse || ''
    accountDataLocal.value.gender = (newUser.sexe as any) || ''
    accountDataLocal.value.birthDate = (newUser.date_naissance as any) || ''
    // Avatar depuis stockage local si disponible
    const stored = localStorage.getItem(getAvatarStorageKey(newUser.id))
    accountDataLocal.value.avatarImg = stored || avatar1
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
    accountDataLocal.value.phone = user.value.telephone || ''
    accountDataLocal.value.nationality = user.value.nationalite || ''
    accountDataLocal.value.country = user.value.pays || ''
    accountDataLocal.value.region = user.value.region || ''
    accountDataLocal.value.city = user.value.ville || ''
    accountDataLocal.value.address = user.value.adresse || ''
    accountDataLocal.value.gender = (user.value.sexe as any) || ''
    accountDataLocal.value.birthDate = (user.value.date_naissance as any) || ''
  }
}

// Fonction pour sauvegarder les modifications
const saveChanges = async () => {
  if (!user.value) return

  // Valider le formulaire avant ouverture du modal
  const { valid } = await formRef.value.validate()
  if (!valid) return

  confirmDialog.value = true
}

// Désactiver le compte (StatutCompteEnum: 'inactif')
const openStatusConfirm = (action: 'deactivate' | 'activate') => {
  statusAction.value = action
  statusConfirmDialog.value = true
}

const confirmStatusChange = async () => {
  if (!user.value) return
  statusConfirming.value = true
  actionSuccess.value = null
  try {
    const { UsersApi } = await import('@/utils/services')
    const newStatus = statusAction.value === 'deactivate' ? 'inactif' : 'actif'
    await UsersApi.changeStatus(user.value.id, newStatus)
    await fetchUserProfile()
    isAccountDeactivated.value = false
    actionSuccess.value = t('system.users.notifications.status_success') as string
    notifySuccess(actionSuccess.value)
    statusConfirmDialog.value = false
  } catch (e) {
    console.error('Erreur lors du changement de statut du compte:', e)
    notifyError(t('system.users.notifications.action_error') as string)
  } finally {
    statusConfirming.value = false
  }
}

// ---------- Validations ----------
const rules = {
  required: (v: string) => !!(v && v.toString().trim()) || t('validation.required'),
  email: (v: string) => {
    if (!v) return true
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(v) || t('validation.email')
  },
  max: (max: number) => (v: string) => {
    if (!v) return true
    return String(v).length <= max || t('validation.maxLength', { max })
  },
  date: (v: string) => {
    if (!v) return true
    return !isNaN(Date.parse(v)) || t('validation.date')
  },
  sexe: (v: string) => {
    if (!v) return true
    return ['homme', 'femme', 'autre'].includes(v) || t('validation.oneOf', { values: 'homme, femme, autre' })
  },
}

// ---------- Modal de confirmation ----------
const confirmDialog = ref(false)
const confirming = ref(false)

const onConfirmSave = async () => {
  if (!user.value) return
  confirming.value = true
  saveError.value = null
  try {
    isSaving.value = true
    await updateUserProfile({
      prenom: accountDataLocal.value.firstName,
      nom: accountDataLocal.value.lastName,
      email: accountDataLocal.value.email,
      telephone: accountDataLocal.value.phone || undefined,
      nationalite: accountDataLocal.value.nationality || undefined,
      pays: accountDataLocal.value.country || undefined,
      region: accountDataLocal.value.region || undefined,
      ville: accountDataLocal.value.city || undefined,
      adresse: accountDataLocal.value.address || undefined,
      sexe: (accountDataLocal.value.gender as any) || undefined,
      date_naissance: accountDataLocal.value.birthDate || undefined,
    })
    confirmDialog.value = false
    actionSuccess.value = t('accountNotifications.update_success') as string
    notifySuccess(actionSuccess.value)
  } catch (err: any) {
    saveError.value = err?.message || (t('accountNotifications.update_error') as string)
    notifyError(t('accountNotifications.update_error') as string, saveError.value || undefined)
  } finally {
    confirming.value = false
    isSaving.value = false
  }
}

// changeAvatar function (upload vers backend + mise à jour locale immédiate)
const changeAvatar = async (event: Event) => {
  const { files } = event.target as HTMLInputElement
  if (!files || !files.length || !user.value) return

  const file = files[0]
  const previous = accountDataLocal.value.avatarImg

  try {
    uploadingAvatar.value = true
    // Upload vers l'API fichiers (type image)
    const response = await filesApi.uploadFile(file, 'image')
    // Sauvegarder l'URL globale par utilisateur connecté
    localStorage.setItem(getAvatarStorageKey(user.value.id), response.url)
    // Mettre à jour l'avatar affiché
    accountDataLocal.value.avatarImg = response.url
    notifySuccess(t('accountNotifications.avatar_upload_success') as string)
  } catch (e) {
    // Revenir à l'état précédent en cas d'échec
    accountDataLocal.value.avatarImg = previous
    notifyError(t('accountNotifications.avatar_upload_error') as string)
  } finally {
    uploadingAvatar.value = false
      // Nettoyer la valeur de l'input fichier pour permettre un nouvel upload du même fichier si besoin
      ; (event.target as HTMLInputElement).value = ''
  }
}

// reset avatar image
const resetAvatar = () => {
  if (user.value) localStorage.removeItem(getAvatarStorageKey(user.value.id))
  accountDataLocal.value.avatarImg = avatar1
  notifySuccess(t('accountNotifications.avatar_reset_success') as string)
}

// Options localisées pays / nationalités (comme création utilisateur)
const locale = useI18n().locale
const countryOptions = computed<{ title: string; code: string; flag: string }[]>(() => {
  const lang = (locale.value || 'en').toString().startsWith('fr') ? 'fr' : 'en'
  return (countries as any[])
    .map((c: any) => ({
      title: (c.translations?.[lang]?.common) || c.name?.common || '',
      code: c.cca2 || c.ccn3 || (c.name?.common || ''),
      flag: c.flag || (c.cca2 ? String.fromCodePoint(...[...c.cca2.toUpperCase()].map(ch => 127397 + ch.charCodeAt(0))) : '🏳️')
    }))
    .filter((opt: any) => !!opt.title)
    .sort((a: any, b: any) => a.title.localeCompare(b.title))
})

const nationalityOptions = computed<{ title: string; code: string }[]>(() => {
  const lang = (locale.value || 'en').toString().startsWith('fr') ? 'fr' : 'en'
  const demonymKey = lang === 'fr' ? 'fra' : 'eng'
  const set = new Set<string>()
  const map = new Map<string, string>()
  for (const c of (countries as any[])) {
    const dem = c?.demonyms?.[demonymKey]?.m || c?.demonyms?.[demonymKey]?.f
    const translated = c?.translations?.[lang]?.common || c?.name?.common
    const title = dem || translated
    const code = c.cca2 || c.ccn3 || translated
    if (title && code) {
      set.add(title)
      map.set(title, code)
    }
  }
  return Array.from(set)
    .map((n: string) => ({ title: n, code: map.get(n) as string }))
    .sort((a: any, b: any) => a.title.localeCompare(b.title))
})
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
              <VBtn color="primary" :loading="uploadingAvatar" :disabled="uploadingAvatar" @click="refInputEl?.click()">
                <VIcon icon="ri-upload-cloud-line" class="d-sm-none" />
                <span class="d-none d-sm-block">{{ $t('account.uploadPhoto') }}</span>
              </VBtn>

              <input ref="refInputEl" type="file" name="file" accept="image/*" hidden @change="changeAvatar">

              <VBtn type="reset" color="error" variant="outlined" :disabled="uploadingAvatar" @click="resetAvatar">
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
          <VForm class="mt-6" ref="formRef">
            <VRow>
              <!-- 👉 First Name -->
              <VCol md="4" cols="12">
                <VTextField v-model="accountDataLocal.firstName" :placeholder="$t('account.placeholders.firstName')"
                  :label="$t('account.firstName')" :disabled="isLoading" :rules="[rules.required]"
                  prepend-inner-icon="ri-user-line" />
              </VCol>

              <!-- 👉 Last Name -->
              <VCol md="4" cols="12">
                <VTextField v-model="accountDataLocal.lastName" :placeholder="$t('account.placeholders.lastName')"
                  :label="$t('account.lastName')" :disabled="isLoading" :rules="[rules.required]"
                  prepend-inner-icon="ri-user-3-line" />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12" md="4">
                <VTextField v-model="accountDataLocal.email" :label="$t('account.email')"
                  :placeholder="$t('account.placeholders.email')" type="email" :disabled="isLoading"
                  :rules="[rules.email]" prepend-inner-icon="ri-mail-line" />
              </VCol>

              <!-- 👉 Phone -->
              <VCol cols="12" md="4">
                <VTextField v-model="accountDataLocal.phone" :label="$t('account.phone')"
                  :placeholder="$t('account.placeholders.phone')" :disabled="isLoading" :rules="[rules.max(30)]"
                  prepend-inner-icon="ri-phone-line" />
              </VCol>

              <!-- 👉 Address -->
              <VCol cols="12" md="4">
                <VTextField v-model="accountDataLocal.address" :label="$t('account.address')"
                  :placeholder="$t('account.placeholders.address')" :disabled="isLoading" :rules="[rules.max(255)]"
                  prepend-inner-icon="ri-map-pin-line" />
              </VCol>

              <!-- 👉 Country -->
              <VCol cols="12" md="4">
                <VAutocomplete v-model="accountDataLocal.country" :label="$t('account.country')"
                  :placeholder="$t('account.placeholders.selectCountry')" :items="countryOptions" item-title="title"
                  item-value="code" :disabled="isLoading" prepend-inner-icon="ri-earth-line" clearable hide-selected>
                  <template #item="{ props, item }">
                    <VListItem v-bind="props" :title="item.raw.title">
                      <template #prepend>
                        <span class="me-3" style="font-size: 1.2em;">{{ item.raw.flag }}</span>
                      </template>
                    </VListItem>
                  </template>
                  <template #selection="{ item }">
                    <span class="me-2" style="font-size: 1.1em;">{{ item.raw.flag }}</span>
                    {{ item.raw.title }}
                  </template>
                </VAutocomplete>
              </VCol>

              <!-- 👉 Nationality -->
              <VCol cols="12" md="4">
                <VAutocomplete v-model="accountDataLocal.nationality" :label="$t('account.nationality')"
                  :placeholder="$t('account.placeholders.nationality')" :items="nationalityOptions" item-title="title"
                  item-value="code" :disabled="isLoading" prepend-inner-icon="ri-passport-line" clearable
                  hide-selected />
              </VCol>

              <!-- 👉 Region -->
              <VCol cols="12" md="4">
                <VTextField v-model="accountDataLocal.region" :label="$t('account.region')"
                  :placeholder="$t('account.placeholders.region')" :disabled="isLoading" :rules="[rules.max(100)]"
                  prepend-inner-icon="ri-map-2-line" />
              </VCol>

              <!-- 👉 City -->
              <VCol cols="12" md="4">
                <VTextField v-model="accountDataLocal.city" :label="$t('account.city')"
                  :placeholder="$t('account.placeholders.city')" :disabled="isLoading" :rules="[rules.max(100)]"
                  prepend-inner-icon="ri-building-2-line" />
              </VCol>

              <!-- 👉 Gender -->
              <VCol cols="12" md="4">
                <VSelect v-model="accountDataLocal.gender" :label="$t('system.users.details.gender')" :items="[
                  { value: 'homme', title: $t('system.users.gender.homme') as string },
                  { value: 'femme', title: $t('system.users.gender.femme') as string },
                  { value: 'autre', title: $t('system.users.gender.autre') as string }
                ]" :disabled="isLoading" :rules="[rules.sexe]" prepend-inner-icon="ri-user-heart-line" />
              </VCol>

              <!-- 👉 Birth date -->
              <VCol cols="12" md="8">
                <VTextField v-model="accountDataLocal.birthDate" :label="$t('system.users.details.birth_date')"
                  type="date" :disabled="isLoading" prepend-inner-icon="ri-calendar-line" />
              </VCol>

              <!-- 👉 Form Actions -->
              <VCol cols="12" class="d-flex flex-wrap gap-4">
                <VBtn :loading="isSaving" :disabled="isSaving" @click="saveChanges">
                  {{ isSaving ? $t('common.loading') : $t('account.saveChanges') }}
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

          <div class="d-flex align-center gap-3 mt-3">
            <VBtn v-if="user?.statut === 'actif'" :disabled="!isAccountDeactivated" color="error"
              @click="openStatusConfirm('deactivate')">
              {{ $t('system.users.actions.deactivate') }}
            </VBtn>
            <VBtn v-else color="success" @click="openStatusConfirm('activate')">
              {{ $t('system.users.actions.activate') }}
            </VBtn>
          </div>

          <VAlert v-if="actionSuccess" type="success" variant="tonal" class="mt-4">{{ actionSuccess }}</VAlert>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <!-- Modal de confirmation statut -->
  <VDialog v-model="statusConfirmDialog" max-width="520" persistent>
    <VCard>
      <VCardTitle class="text-h6">
        {{ $t('system.users.confirm.status_title') }}
      </VCardTitle>
      <VCardText>
        {{ $t('system.users.confirm.status_message') }}
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="outlined" color="secondary" @click="statusConfirmDialog = false">{{ $t('common.cancel') }}</VBtn>
        <VBtn color="primary" :loading="statusConfirming" @click="confirmStatusChange">{{ $t('common.confirm') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Modal de confirmation -->
  <VDialog v-model="confirmDialog" max-width="520" persistent>
    <VCard>
      <VCardTitle class="text-h6">
        {{ $t('system.users.confirm.edit_title') || $t('account.details') }}
      </VCardTitle>
      <VCardText>
        {{ $t('system.users.confirm.edit_message') || $t('common.confirm') }}
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="outlined" color="secondary" @click="confirmDialog = false">{{ $t('common.cancel') }}</VBtn>
        <VBtn color="primary" :loading="confirming" @click="onConfirmSave">{{ $t('common.save') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
