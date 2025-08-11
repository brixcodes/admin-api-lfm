<script lang="ts" setup>
import Evaluations from '@/pages/formations/evaluations.vue'
import Index from '@/pages/formations/index.vue'
import Modules from '@/pages/formations/modules.vue'
import Ressources from '@/pages/formations/ressources.vue'

import { useRoute } from 'vue-router'

const route = useRoute()

// Fonction pour obtenir l'onglet par défaut avec persistance
const getDefaultTab = () => {
  // 1. Priorité à l'URL query parameter
  if (route.query.tab) {
    return route.query.tab as string
  }

  // 2. Fallback vers localStorage
  const savedTab = localStorage.getItem('formations-active-tab')
  if (savedTab) {
    return savedTab
  }

  // 3. Valeur par défaut
  return 'index'
}

const activeTab = ref(getDefaultTab())

watch(activeTab, val => {
  // Sauvegarder dans localStorage
  localStorage.setItem('formations-active-tab', val)

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
  { title: 'Catalogue', icon: 'ri-book-open-line', tab: 'index', component: Index },
  { title: 'Modules', icon: 'ri-layout-masonry-line', tab: 'modules', component: Modules },
  { title: 'Ressources', icon: 'ri-folder-3-line', tab: 'ressources', component: Ressources },
  { title: 'Évaluations', icon: 'ri-list-check-2', tab: 'evaluations', component: Evaluations },
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
