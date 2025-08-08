<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <VRow>
    <VCol cols="12" md="4">
      <VCard color="primary" variant="tonal">
        <VCardText class="text-center">{{ $t('ui.cards.solid') }}</VCardText>
      </VCard>
    </VCol>
    <VCol cols="12" md="4">
      <VCard color="secondary" variant="tonal">
        <VCardText class="text-center">{{ $t('ui.cards.solid') }}</VCardText>
      </VCard>
    </VCol>
    <VCol cols="12" md="4">
      <VCard color="success" variant="tonal">
        <VCardText class="text-center">{{ $t('ui.cards.solid') }}</VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

