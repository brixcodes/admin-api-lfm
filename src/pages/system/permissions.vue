<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
<template>
  <VCard>
    <VCardTitle>
      <VIcon icon="ri-key-2-line" class="me-2" />
      {{ $t('pages.permissions.title') }}
    </VCardTitle>
    <VCardText>
      <p>{{ $t('pages.permissions.description') }}</p>
    </VCardText>
  </VCard>
</template>

