<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <VCard>
    <VCardTitle>
      <VIcon icon="ri-image-line" class="me-2" />
      {{ $t('files.images.title') }}
    </VCardTitle>
    <VCardText>
      <p>{{ $t('files.images.description') }}</p>
    </VCardText>
  </VCard>
</template>

