<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
<template>
  <VCard>
    <VCardTitle>
      <VIcon icon="ri-file-add-line" class="me-2" />
      {{ $t('pages.inscriptions.title') }}
    </VCardTitle>
    <VCardText>
      <p>{{ $t('pages.inscriptions.description') }}</p>
    </VCardText>
  </VCard>
</template>

