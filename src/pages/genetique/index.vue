<script lang="ts" setup>
import Ascendance from '@/pages/genetique/ascendance.vue'
import Education from '@/pages/genetique/education.vue'
import Individuel from '@/pages/genetique/individuel.vue'
import PII from '@/pages/genetique/plan-intervention.vue'
import Sante from '@/pages/genetique/sante.vue'

import { useRoute } from 'vue-router'

const route = useRoute()

// Fonction pour obtenir l'onglet par défaut avec persistance
const getDefaultTab = () => {
  // 1. Priorité à l'URL query parameter
  if (route.query.tab) {
    return route.query.tab as string
  }

  // 2. Fallback vers localStorage
  const savedTab = localStorage.getItem('genetique-active-tab')
  if (savedTab) {
    return savedTab
  }

  // 3. Valeur par défaut
  return 'individuel'
}

const activeTab = ref(getDefaultTab())

watch(activeTab, val => {
  // Sauvegarder dans localStorage
  localStorage.setItem('genetique-active-tab', val)

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
  { title: 'Individuel', icon: 'ri-user-3-line', tab: 'individuel', component: Individuel },
  { title: 'Ascendance', icon: 'ri-family-line', tab: 'ascendance', component: Ascendance },
  { title: 'Santé', icon: 'ri-heart-pulse-line', tab: 'sante', component: Sante },
  { title: 'Éducation', icon: 'ri-graduation-cap-line', tab: 'education', component: Education },
  { title: 'PII', icon: 'ri-clipboard-line', tab: 'pii', component: PII },
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
