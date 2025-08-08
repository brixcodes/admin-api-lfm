<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <VCard>
    <VCardTitle>
      <VIcon icon="ri-video-line" class="me-2" />
      {{ $t('files.videos.title') }}
    </VCardTitle>
    <VCardText>
      <p>{{ $t('files.videos.description') }}</p>
    </VCardText>
  </VCard>
</template>

