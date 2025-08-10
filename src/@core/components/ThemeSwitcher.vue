<script setup lang="ts">
import { useAppTheme } from '@/utils/theme';
import type { ThemeSwitcherTheme } from '@layouts/types';
import { useTheme } from 'vuetify';

const props = defineProps<{
  themes: ThemeSwitcherTheme[]
}>()

const { name: themeName, global: globalTheme } = useTheme()
const { toggleTheme, getCurrentTheme } = useAppTheme()
const { state: currentThemeName, next: getNextThemeName, index: currentThemeIndex } = useCycleList(props.themes.map(t => t.name), { initialValue: themeName })

const changeTheme = () => {
  toggleTheme()
}

// Update icon if theme is changed from other sources
watch(() => globalTheme.name.value, val => {
  currentThemeName.value = val
})
</script>

<template>
  <IconBtn @click="changeTheme">
    <VIcon :icon="props.themes[currentThemeIndex].icon" />
    <VTooltip activator="parent" open-delay="1000" scroll-strategy="close">
      <span class="text-capitalize">
        {{ currentThemeName === 'light' ? 'Mode clair' : 'Mode sombre' }}
        <br>
        <small class="text-caption opacity-75">Sauvegardé automatiquement</small>
      </span>
    </VTooltip>
  </IconBtn>
</template>
