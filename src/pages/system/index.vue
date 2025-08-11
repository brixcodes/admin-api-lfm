<script lang="ts" setup>
import Journal from '@/pages/system/journal.vue'
import Permissions from '@/pages/system/permissions.vue'
import Roles from '@/pages/system/roles.vue'
import Utilisateurs from '@/pages/system/utilisateurs.vue'


import { useRoute } from 'vue-router'

const route = useRoute()

// Fonction pour obtenir l'onglet par défaut avec persistance
const getDefaultTab = () => {
  // 1. Priorité à l'URL query parameter
  if (route.query.tab) {
    return route.query.tab as string
  }

  // 2. Fallback vers localStorage
  const savedTab = localStorage.getItem('system-active-tab')
  if (savedTab) {
    return savedTab
  }

  // 3. Valeur par défaut
  return 'utilisateurs'
}

const activeTab = ref(getDefaultTab())

watch(activeTab, val => {
  // Sauvegarder dans localStorage
  localStorage.setItem('system-active-tab', val)

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
  { title: 'Utilisateurs', icon: 'ri-user-3-line', tab: 'utilisateurs', component: Utilisateurs },
  { title: 'Rôles', icon: 'ri-shield-keyhole-line', tab: 'roles', component: Roles },
  { title: 'Permissions', icon: 'ri-key-2-line', tab: 'permissions', component: Permissions },
  { title: 'Journal', icon: 'ri-file-list-3-line', tab: 'journal', component: Journal },
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
