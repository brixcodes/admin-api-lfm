<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()
const languages = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
]

function setLang(code: 'fr' | 'en') {
  locale.value = code
  localStorage.setItem('locale', code)
  document.documentElement.lang = code
}
</script>

<template>
  <VMenu location="bottom end">
    <template #activator="{ props }">
      <IconBtn v-bind="props" class="me-2">
        <VIcon icon="ri-global-line" />
      </IconBtn>
    </template>
    <VList density="compact">
      <VListItem v-for="l in languages" :key="l.code" :active="locale.value === l.code"
        @click="setLang(l.code as 'fr' | 'en')">
        <VListItemTitle>{{ l.label }}</VListItemTitle>
      </VListItem>
    </VList>
  </VMenu>
</template>
