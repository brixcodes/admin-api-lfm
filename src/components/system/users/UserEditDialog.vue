<script setup lang="ts">
import type { UtilisateurLight, UtilisateurUpdate, RoleLight } from '@/utils/types/models'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  modelValue: boolean
  user?: UtilisateurLight | null
  roles: RoleLight[]
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', payload: { userId: number; data: UtilisateurUpdate }): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

// Form state
const form = ref<UtilisateurUpdate>({
  nom: '',
  prenom: '',
  email: '',
  sexe: 'homme',
  role_name: undefined
})

const formErrors = ref<Record<string, string>>({})

// Validation rules
const rules = {
  nom: [
    (v: string) => !!v || t('system.users.validation.name_required'),
    (v: string) => v.length >= 2 || t('system.users.validation.name_min_length')
  ],
  email: [
    (v: string) => !!v || t('system.users.validation.email_required'),
    (v: string) => /.+@.+\..+/.test(v) || t('system.users.validation.email_invalid')
  ]
}

// Computed properties
const fullName = computed(() => {
  if (!props.user) return ''
  return `${props.user.prenom || ''} ${props.user.nom}`.trim()
})

const avatarText = computed(() => {
  if (!props.user) return ''
  const name = fullName.value
  const words = name.split(' ')
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const roleOptions = computed(() => [
  { title: t('system.users.no_role'), value: null },
  ...props.roles.map(role => ({
    title: t(`system.roles.labels.${role.nom}`),
    value: role.nom
  }))
])

const genderOptions = computed(() => [
  { title: t('system.users.gender.homme'), value: 'homme' },
  { title: t('system.users.gender.femme'), value: 'femme' }
])

const isFormValid = computed(() => {
  return form.value.nom && 
         form.value.email && 
         /.+@.+\..+/.test(form.value.email) &&
         Object.keys(formErrors.value).length === 0
})

// Watch for user changes
watch(() => props.user, (newUser) => {
  if (newUser) {
    form.value = {
      nom: newUser.nom,
      prenom: newUser.prenom || '',
      email: newUser.email,
      sexe: newUser.sexe,
      role_name: newUser.role?.nom || undefined
    }
    formErrors.value = {}
  }
}, { immediate: true })

// Watch for dialog open/close
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    formErrors.value = {}
  }
})

// Methods
const validateField = (field: keyof typeof form.value, value: any) => {
  const fieldRules = rules[field as keyof typeof rules]
  if (fieldRules) {
    for (const rule of fieldRules) {
      const result = rule(value)
      if (result !== true) {
        formErrors.value[field] = result
        return false
      }
    }
  }
  delete formErrors.value[field]
  return true
}

const saveUser = () => {
  if (!props.user || !isFormValid.value) return
  
  // Validate all fields
  let hasErrors = false
  Object.keys(form.value).forEach(key => {
    const field = key as keyof typeof form.value
    if (!validateField(field, form.value[field])) {
      hasErrors = true
    }
  })
  
  if (hasErrors) return
  
  emit('save', {
    userId: props.user.id,
    data: form.value
  })
}

const closeDialog = () => {
  emit('update:modelValue', false)
}

const resetForm = () => {
  if (props.user) {
    form.value = {
      nom: props.user.nom,
      prenom: props.user.prenom || '',
      email: props.user.email,
      sexe: props.user.sexe,
      role_name: props.user.role?.nom || undefined
    }
  }
  formErrors.value = {}
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <VCard v-if="user">
      <VCardTitle class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <VIcon icon="ri-edit-line" class="me-2" />
          <span>{{ t('system.users.edit.title') }}</span>
        </div>
        <VBtn
          icon
          variant="text"
          size="small"
          @click="closeDialog"
        >
          <VIcon icon="ri-close-line" />
        </VBtn>
      </VCardTitle>

      <VCardText>
        <!-- User Header -->
        <div class="d-flex align-center mb-6">
          <VAvatar
            size="60"
            color="primary"
            variant="tonal"
            class="me-4"
          >
            <span class="text-h6 font-weight-bold">{{ avatarText }}</span>
          </VAvatar>
          
          <div>
            <h5 class="text-h5 mb-1">{{ fullName }}</h5>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ t('system.users.edit.subtitle') }}</p>
          </div>
        </div>

        <!-- Edit Form -->
        <VForm @submit.prevent="saveUser">
          <VRow>
            <!-- First Name -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.prenom"
                :label="t('system.users.edit.first_name')"
                :placeholder="t('system.users.edit.first_name_placeholder')"
                variant="outlined"
                prepend-inner-icon="ri-user-line"
                clearable
              />
            </VCol>

            <!-- Last Name -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="form.nom"
                :label="t('system.users.edit.last_name')"
                :placeholder="t('system.users.edit.last_name_placeholder')"
                :rules="rules.nom"
                :error-messages="formErrors.nom"
                variant="outlined"
                prepend-inner-icon="ri-user-line"
                required
                @blur="validateField('nom', form.nom)"
              />
            </VCol>

            <!-- Email -->
            <VCol cols="12">
              <VTextField
                v-model="form.email"
                :label="t('system.users.edit.email')"
                :placeholder="t('system.users.edit.email_placeholder')"
                :rules="rules.email"
                :error-messages="formErrors.email"
                variant="outlined"
                prepend-inner-icon="ri-mail-line"
                type="email"
                required
                @blur="validateField('email', form.email)"
              />
            </VCol>

            <!-- Gender -->
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.sexe"
                :label="t('system.users.edit.gender')"
                :items="genderOptions"
                variant="outlined"
                prepend-inner-icon="ri-user-3-line"
              />
            </VCol>

            <!-- Role -->
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.role_name"
                :label="t('system.users.edit.role')"
                :items="roleOptions"
                variant="outlined"
                prepend-inner-icon="ri-shield-user-line"
                clearable
              />
            </VCol>
          </VRow>
        </VForm>

        <!-- Current Role Info -->
        <VAlert
          v-if="user.role"
          type="info"
          variant="tonal"
          class="mt-4"
        >
          <div class="d-flex align-center">
            <VIcon icon="ri-information-line" class="me-2" />
            <div>
              <div class="font-weight-medium">{{ t('system.users.edit.current_role') }}</div>
              <div class="text-caption">
                {{ t(`system.roles.labels.${user.role.nom}`) }} - 
                {{ user.role.permissions?.length || 0 }} {{ t('system.users.permissions_count') }}
              </div>
            </div>
          </div>
        </VAlert>
      </VCardText>

      <VCardActions class="justify-space-between">
        <VBtn
          variant="outlined"
          @click="resetForm"
          :disabled="loading"
        >
          <VIcon start icon="ri-refresh-line" />
          {{ t('common.reset') }}
        </VBtn>
        
        <div class="d-flex gap-2">
          <VBtn
            color="primary"
            :disabled="!isFormValid"
            :loading="loading"
            @click="saveUser"
          >
            <VIcon start icon="ri-save-line" />
            {{ t('common.save') }}
          </VBtn>
        </div>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
