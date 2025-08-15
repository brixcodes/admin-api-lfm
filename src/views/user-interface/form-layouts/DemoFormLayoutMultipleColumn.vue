<script lang="ts" setup>
const firstName = ref('')
const lastName = ref('')
const city = ref('')
const country = ref('')
const company = ref('')
const email = ref('')
const checkbox = ref(false)
</script>

<template>
  <VForm @submit.prevent="() => { }">
    <VRow>
      <!-- 👉 First Name -->
      <VCol cols="12" md="6">
        <VTextField v-model="firstName" :label="$t('ui.forms.firstName')" :placeholder="$t('ui.forms.firstName')" />
      </VCol>

      <!-- 👉 Last Name -->
      <VCol cols="12" md="6">
        <VTextField v-model="lastName" :label="$t('ui.forms.lastName') || $t('ui.forms.firstName')"
          :placeholder="$t('ui.forms.lastName') || $t('ui.forms.firstName')" />
      </VCol>

      <!-- 👉 Email -->
      <VCol cols="12" md="6">
        <VTextField v-model="email" :label="$t('ui.forms.email')" :placeholder="$t('ui.forms.email')" />
      </VCol>

      <!-- 👉 City -->
      <VCol cols="12" md="6">
        <VTextField v-model="city" :label="$t('account.city')" :placeholder="$t('account.city')" />
      </VCol>

      <!-- 👉 Country -->
      <VCol cols="12" md="6">
        <VTextField v-model="country" :label="$t('account.country')" :placeholder="$t('account.country')" />
      </VCol>

      <!-- 👉 Company -->
      <VCol cols="12" md="6">
        <VTextField v-model="company" :label="$t('account.organization')" :placeholder="$t('account.organization')" />
      </VCol>

      <!-- 👉 Remember me -->
      <VCol cols="12">
        <VCheckbox v-model="checkbox" :label="$t('login.remember')" />
      </VCol>

      <VCol cols="12" class="d-flex gap-4">
        <VBtn type="submit">
          {{ $t('dashboard.submit') }}
        </VBtn>

        <VBtn type="reset" color="secondary" variant="outlined">
          {{ $t('dashboard.reset') }}
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
