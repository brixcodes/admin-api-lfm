<script lang="ts" setup>
const firstName = ref('')
const email = ref('')
const mobile = ref<number>()
const password = ref<string>()
const checkbox = ref(false)
</script>

<template>
  <VForm @submit.prevent>
    <VRow>
      <VCol cols="12">
        <VTextField v-model="firstName" prepend-inner-icon="ri-user-line" label="$t('ui.forms.firstName')"
          :placeholder="$t('ui.forms.firstName')" />
      </VCol>

      <VCol cols="12">
        <VTextField v-model="email" prepend-inner-icon="ri-mail-line" label="$t('ui.forms.email')" type="email"
          :placeholder="$t('ui.forms.email')" />
      </VCol>

      <VCol cols="12">
        <VTextField v-model="mobile" prepend-inner-icon="ri-smartphone-line" label="$t('ui.forms.mobile')" type="number"
          :placeholder="$t('ui.forms.mobile')" />
      </VCol>

      <VCol cols="12">
        <VTextField v-model="password" prepend-inner-icon="ri-lock-line" label="$t('ui.forms.password')" type="password"
          :placeholder="$t('ui.forms.password')" />
      </VCol>

      <VCol cols="12">
        <VCheckbox v-model="checkbox" :label="$t('login.remember')" />
      </VCol>

      <VCol cols="12">
        <VBtn type="submit" class="me-2">
          Submit
        </VBtn>

        <VBtn color="secondary" type="reset" variant="outlined">
          Reset
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
