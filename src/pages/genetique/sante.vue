<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
<template>
  <VCard>
    <VCardTitle>
      <VIcon icon="ri-heart-pulse-line" class="me-2" />
      {{ $t('pages.genetique.sante.title') }}
    </VCardTitle>
    <VCardText>
      <p>{{ $t('pages.genetique.sante.description') }}</p>
    </VCardText>
  </VCard>
</template>

