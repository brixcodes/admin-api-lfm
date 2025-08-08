<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
<template>
  <VCard>
    <VCardTitle>
      <VIcon icon="ri-file-list-3-line" class="me-2" />
      {{ $t('pages.journal.title') }} d'activité
    </VCardTitle>
    <VCardText>
      <p>{{ $t('pages.journal.description') }}</p>
    </VCardText>
  </VCard>
</template>

