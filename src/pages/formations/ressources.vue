<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <VCard>
    <VCardTitle>
      <VIcon icon="ri-folder-3-line" class="me-2" />
      {{ $t('formations.resources.title') }}
    </VCardTitle>
    <VCardText>
      <p>{{ $t('formations.resources.description') }}</p>
    </VCardText>
  </VCard>
</template>

