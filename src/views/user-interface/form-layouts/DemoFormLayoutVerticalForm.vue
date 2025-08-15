<script lang="ts" setup>
const firstName = ref('')
const email = ref('')
const mobile = ref<number>()
const password = ref<string>()
const checkbox = ref(false)
</script>

<template>
  <VForm @submit.prevent="() => { }">
    <VRow>
      <VCol cols="12">
        <VTextField v-model="firstName" :label="$t('ui.forms.firstName')" :placeholder="$t('ui.forms.firstName')" />
      </VCol>

      <VCol cols="12">
        <VTextField v-model="email" :label="$t('ui.forms.email')" type="email" :placeholder="$t('ui.forms.email')" />
      </VCol>

      <VCol cols="12">
        <VTextField v-model="mobile" :label="$t('ui.forms.mobile')" type="number"
          :placeholder="$t('ui.forms.mobile')" />
      </VCol>

      <VCol cols="12">
        <VTextField v-model="password" :label="$t('ui.forms.password')" type="password"
          :placeholder="$t('ui.forms.password')" />
      </VCol>

      <VCol cols="12">
        <VCheckbox v-model="checkbox" :label="$t('login.remember')" />
      </VCol>

      <VCol cols="12" class="d-flex gap-4">
        <VBtn type="submit">
          Submit
        </VBtn>

        <VBtn type="reset" color="secondary" variant="outlined">
          Reset
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
