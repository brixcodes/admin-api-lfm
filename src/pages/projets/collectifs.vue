<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
<template>
  <VCard>
    <VCardTitle>
      <VIcon icon="ri-team-line" class="me-2" />
      Projets collectifs
    </VCardTitle>
    <VCardText>
      <p>{{ $t('pages.projets.collectifs.description') }}</p>
    </VCardText>
  </VCard>
</template>

