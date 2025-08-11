<script lang="ts" setup>
import Chefs from '@/pages/projets/chefs-doeuvre.vue'
import Collectifs from '@/pages/projets/collectifs.vue'

import { useRoute } from 'vue-router'

const route = useRoute()

// Fonction pour obtenir l'onglet par défaut avec persistance
const getDefaultTab = () => {
  // 1. Priorité à l'URL query parameter
  if (route.query.tab) {
    return route.query.tab as string
  }

  // 2. Fallback vers localStorage
  const savedTab = localStorage.getItem('projets-active-tab')
  if (savedTab) {
    return savedTab
  }

  // 3. Valeur par défaut
  return 'chefs'
}

const activeTab = ref(getDefaultTab())

watch(activeTab, val => {
  // Sauvegarder dans localStorage
  localStorage.setItem('projets-active-tab', val)

  // Mettre à jour l'URL
  const q = new URLSearchParams(route.query as any)
  q.set('tab', val)
  history.replaceState(null, '', `${route.path}?${q.toString()}`)
})

// Écouter les changements de route pour synchroniser l'onglet
watch(() => route.query.tab, (newTab) => {
  if (newTab && newTab !== activeTab.value) {
    activeTab.value = newTab as string
  }
})
const tabs = [
  { title: 'Chefs-d\'œuvre', icon: 'ri-award-line', tab: 'chefs', component: Chefs },
  { title: 'Collectifs', icon: 'ri-team-line', tab: 'collectifs', component: Collectifs },
]
</script>

<template>
  <div>
    <VTabs v-model="activeTab" show-arrows class="v-tabs-pill">
      <VTab v-for="t in tabs" :key="t.tab" :value="t.tab">
        <VIcon size="20" start :icon="t.icon" />
        {{ t.title }}
      </VTab>
    </VTabs>

    <VWindow v-model="activeTab" class="mt-5 disable-tab-transition" :touch="false">
      <VWindowItem v-for="t in tabs" :key="t.tab" :value="t.tab">
        <component :is="t.component" />
      </VWindowItem>
    </VWindow>
  </div>
</template>
