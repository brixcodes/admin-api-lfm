<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <VCard>
    <VCardTitle>
      <VIcon icon="ri-file-2-line" class="me-2" />
      {{ $t('files.documents.title') }}
    </VCardTitle>
    <VCardText>
      <p>{{ $t('files.documents.description') }}</p>
    </VCardText>
  </VCard>
</template>

