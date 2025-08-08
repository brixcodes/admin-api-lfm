<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <VRow>
    <VCol cols="12" md="6">
      <VCard>
        <VCardItem>
          <template #prepend>
            <VAvatar color="primary" variant="tonal" size="40"><VIcon icon="ri-folder-3-line"/></VAvatar>
          </template>
          <VCardTitle>{{ $t('ui.cards.navigation') }}</VCardTitle>
          <template #append>
            <VBtn icon="ri-arrow-right-line" variant="text" />
          </template>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12" md="6">
      <VCard>
        <VCardItem>
          <template #prepend>
            <VAvatar color="secondary" variant="tonal" size="40"><VIcon icon="ri-user-3-line"/></VAvatar>
          </template>
          <VCardTitle>{{ $t('ui.cards.users') }}</VCardTitle>
          <template #append>
            <VBtn icon="ri-arrow-right-line" variant="text" />
          </template>
        </VCardItem>
      </VCard>
    </VCol>
  </VRow>
</template>

