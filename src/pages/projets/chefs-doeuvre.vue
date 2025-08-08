<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
<template>
  <VCard>
    <VCardTitle>
      <VIcon icon="ri-award-line" class="me-2" />
      Chefs-d'œuvre
    </VCardTitle>
    <VCardText>
      <p>{{ $t('pages.projets.chefsOeuvre.description') }}</p>
    </VCardText>
  </VCard>
</template>

