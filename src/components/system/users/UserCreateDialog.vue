<template>
  <VDialog v-model="isOpen" max-width="800" persistent>
    <VCard>
      <VCardTitle class="text-h5 pa-6 pb-4">
        <div class="d-flex align-center">
          <VAvatar size="40" color="primary" variant="tonal" class="me-3">
            <VIcon icon="ri-user-add-line" />
          </VAvatar>
          <div>
            <div class="text-h5">{{ t('system.users.create.title') }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ t('system.users.create.subtitle') }}</div>
          </div>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-6">
        <VForm ref="formRef" @submit.prevent="onSubmit">
          <VRow>
            <!-- Prénom -->
            <VCol cols="12" md="6">
              <VTextField v-model="form.prenom" :label="t('system.users.create.first_name')"
                :placeholder="t('system.users.create.first_name_placeholder')" :error-messages="formErrors.prenom"
                variant="outlined" prepend-inner-icon="ri-user-line" :rules="[rules.required]" required />
            </VCol>

            <!-- Nom -->
            <VCol cols="12" md="6">
              <VTextField v-model="form.nom" :label="t('system.users.create.last_name')"
                :placeholder="t('system.users.create.last_name_placeholder')" :error-messages="formErrors.nom"
                variant="outlined" prepend-inner-icon="ri-user-line" :rules="[rules.required]" required />
            </VCol>

            <!-- Email -->
            <VCol cols="12" md="6">
              <VTextField v-model="form.email" :label="t('system.users.create.email')"
                :placeholder="t('system.users.create.email_placeholder')" :error-messages="formErrors.email"
                variant="outlined" prepend-inner-icon="ri-mail-line" type="email" :rules="[rules.required, rules.email]"
                required />
            </VCol>

            <!-- Sexe -->
            <VCol cols="12" md="6">
              <VSelect v-model="form.sexe" :label="t('system.users.create.gender')" :items="genderOptions"
                :error-messages="formErrors.sexe" variant="outlined" prepend-inner-icon="ri-user-line"
                :rules="[rules.required]" required />
            </VCol>

            <!-- Date de naissance -->
            <VCol cols="12" md="6">
              <VTextField v-model="form.date_naissance" :label="t('system.users.create.birth_date')"
                :placeholder="t('system.users.create.birth_date_placeholder')"
                :error-messages="formErrors.date_naissance" variant="outlined" prepend-inner-icon="ri-calendar-line"
                type="date" clearable />
            </VCol>

            <!-- Rôle -->
            <VCol cols="12" md="6">
              <VSelect v-model="form.role_name" :label="t('system.users.create.role')" :items="roleOptions"
                :error-messages="formErrors.role_name" variant="outlined" prepend-inner-icon="ri-shield-user-line"
                :rules="[rules.required]" required />
            </VCol>
          </VRow>

          <!-- Note sur le mot de passe -->
          <VAlert type="info" variant="tonal" class="mt-4" :text="t('system.users.create.password_note')" />
        </VForm>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-6">
        <VSpacer />
        <VBtn color="error" variant="outlined" @click="onCancel" :disabled="loading">
          {{ t('common.cancel') }}
        </VBtn>
        <VBtn color="primary" variant="flat" @click="onSubmit" :loading="loading">
          {{ t('system.users.create.submit') }}
        </VBtn>
      </VCardActions>
    </VCard>

    <!-- Confirmation Dialog -->
    <VDialog v-model="showConfirmDialog" max-width="500" persistent>
      <VCard>
        <VCardTitle class="text-h5 pa-6 pb-4">
          <div class="d-flex align-center">
            <VAvatar size="40" color="warning" variant="tonal" class="me-3">
              <VIcon icon="ri-question-line" />
            </VAvatar>
            <div>
              <div class="text-h5">{{ t('system.users.create.confirm.title') }}</div>
              <div class="text-body-2 text-medium-emphasis">{{ t('system.users.create.confirm.subtitle') }}</div>
            </div>
          </div>
        </VCardTitle>

        <VDivider />

        <VCardText class="pa-6">
          <div class="text-body-1 mb-4">{{ t('system.users.create.confirm.message') }}</div>

          <!-- User Summary -->
          <VCard variant="tonal" color="secondary" class="mb-4">
            <VCardText class="pa-4">
              <div class="text-subtitle-2 mb-2">{{ t('system.users.create.confirm.summary') }}</div>
              <div class="d-flex flex-column gap-2">
                <div><strong>{{ t('system.users.create.first_name') }}:</strong> {{ form.prenom }}</div>
                <div><strong>{{ t('system.users.create.last_name') }}:</strong> {{ form.nom }}</div>
                <div><strong>{{ t('system.users.create.email') }}:</strong> {{ form.email }}</div>
                <div><strong>{{ t('system.users.create.gender') }}:</strong> {{ t(`system.users.gender.${form.sexe}`) }}
                </div>
                <div><strong>{{ t('system.users.create.role') }}:</strong> {{ selectedRoleLabel }}</div>
                <div v-if="form.date_naissance"><strong>{{ t('system.users.create.birth_date') }}:</strong> {{
                  formatDate(form.date_naissance) }}</div>
              </div>
            </VCardText>
          </VCard>

          <VAlert type="info" variant="tonal" :text="t('system.users.create.confirm.password_info')" />
        </VCardText>

        <VDivider />

        <VCardActions class="pa-6">
          <VSpacer />
          <VBtn color="error" variant="outlined" @click="showConfirmDialog = false" :disabled="loading">
            {{ t('common.cancel') }}
          </VBtn>
          <VBtn color="primary" variant="flat" @click="onConfirmCreate" :loading="loading">
            {{ t('system.users.create.confirm.create') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VDialog>
</template>

<script setup lang="ts">
import type { RoleLight } from '@/utils/types/models'
import { useI18n } from 'vue-i18n'

interface Props {
  modelValue: boolean
  roles: RoleLight[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', user: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

// Form ref
const formRef = ref()

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Form state
const form = ref({
  nom: '',
  prenom: '',
  email: '',
  sexe: 'homme' as const,
  role_name: '' as any,
  date_naissance: undefined as string | undefined
})

const formErrors = ref<Record<string, string[]>>({})
const loading = ref(false)
const showConfirmDialog = ref(false)

// Options
const genderOptions = computed(() => [
  { title: t('system.users.gender.homme'), value: 'homme' },
  { title: t('system.users.gender.femme'), value: 'femme' }
])

const roleOptions = computed(() =>
  props.roles.map(role => ({
    title: t(`system.roles.labels.${role.nom}`),
    value: role.nom
  }))
)

// Computed for selected role label
const selectedRoleLabel = computed(() => {
  const selectedRole = props.roles.find(role => role.nom === form.value.role_name)
  return selectedRole ? t(`system.roles.labels.${selectedRole.nom}`) : ''
})

// Date formatting function
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

// Validation rules
const rules = {
  required: (value: any) => !!value || t('validation.required'),
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || t('validation.email')
  }
}

// Methods
const resetForm = () => {
  form.value = {
    nom: '',
    prenom: '',
    email: '',
    sexe: 'homme' as const,
    role_name: '' as any,
    date_naissance: undefined as string | undefined
  }
  formErrors.value = {}
  formRef.value?.resetValidation()
}

const onCancel = () => {
  resetForm()
  isOpen.value = false
}

const onSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  // Show confirmation dialog instead of creating directly
  showConfirmDialog.value = true
}

const onConfirmCreate = async () => {
  loading.value = true
  formErrors.value = {}

  try {
    emit('created', form.value)
    resetForm()
    showConfirmDialog.value = false
    isOpen.value = false
  } catch (error: any) {
    if (error.response?.data?.detail) {
      // Handle validation errors from backend
      if (typeof error.response.data.detail === 'object') {
        formErrors.value = error.response.data.detail
      }
    }
  } finally {
    loading.value = false
  }
}

// Watch for dialog open/close
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    resetForm()
  }
})
</script>
