<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <VCard>
    <VCardTitle>
      <VIcon icon="ri-layout-masonry-line" class="me-2" />
      {{ $t('formations.modules.title') }}
    </VCardTitle>
    <VCardText>
      <p>{{ $t('formations.modules.description') }}</p>
    </VCardText>
  </VCard>
</template>

