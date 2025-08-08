<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
<template>
  <VCard>
    <VCardTitle>
      <VIcon icon="ri-graduation-cap-line" class="me-2" />
      {{ $t('pages.genetique.education.title') }}
    </VCardTitle>
    <VCardText>
      <p>{{ $t('pages.genetique.education.description') }}</p>
    </VCardText>
  </VCard>
</template>

