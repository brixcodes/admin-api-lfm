<script lang="ts" setup>
import Audios from '@/pages/fichiers/audios.vue'
import Documents from '@/pages/fichiers/documents.vue'
import Images from '@/pages/fichiers/images.vue'
import Videos from '@/pages/fichiers/videos.vue'

import { useRoute } from 'vue-router'

const route = useRoute()

// Fonction pour obtenir l'onglet par défaut avec persistance
const getDefaultTab = () => {
  // 1. Priorité à l'URL query parameter
  if (route.query.tab) {
    return route.query.tab as string
  }

  // 2. Fallback vers localStorage
  const savedTab = localStorage.getItem('fichiers-active-tab')
  if (savedTab) {
    return savedTab
  }

  // 3. Valeur par défaut
  return 'documents'
}

const activeTab = ref(getDefaultTab())

watch(activeTab, val => {
  // Sauvegarder dans localStorage
  localStorage.setItem('fichiers-active-tab', val)

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
  { title: 'Documents', icon: 'ri-file-2-line', tab: 'documents', component: Documents },
  { title: 'Images', icon: 'ri-image-line', tab: 'images', component: Images },
  { title: 'Audios', icon: 'ri-music-2-line', tab: 'audios', component: Audios },
  { title: 'Vidéos', icon: 'ri-video-line', tab: 'videos', component: Videos },
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
