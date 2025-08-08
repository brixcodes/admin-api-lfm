<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <VCard>
    <VCardTitle>
      <VIcon icon="ri-list-check-2" class="me-2" />
      {{ $t('formations.assessments.title') }}
    </VCardTitle>
    <VCardText>
      <p>{{ $t('formations.assessments.description') }}</p>
    </VCardText>
  </VCard>
</template>

