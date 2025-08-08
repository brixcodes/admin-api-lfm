<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
<template>
  <VCard>
    <VCardTitle>
      <VIcon icon="ri-family-line" class="me-2" />
      {{ $t('pages.genetique.ascendance.title') }}
    </VCardTitle>
    <VCardText>
      <p>{{ $t('pages.genetique.ascendance.description') }}</p>
    </VCardText>
  </VCard>
</template>

