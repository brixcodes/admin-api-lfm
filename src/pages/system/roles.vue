<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
<template>
  <VCard>
    <VCardTitle>
      <VIcon icon="ri-shield-keyhole-line" class="me-2" />
      {{ $t('pages.roles.title') }} & {{ $t('pages.permissions.title') }}
    </VCardTitle>
    <VCardText>
      <p>{{ $t('pages.roles.description') }}</p>
    </VCardText>
  </VCard>
</template>

