<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
</script>
<template>
  <VCard>
    <VCardTitle>
      <VIcon icon="ri-dna-line" class="me-2" />
      {{ $t('pages.genetique.individuel.genotype') }} {{ $t('pages.genetique.individuel.title') }}
    </VCardTitle>
    <VCardText>
      <p>{{ $t('pages.genetique.individuel.description') }}</p>
    </VCardText>
  </VCard>
</template>

