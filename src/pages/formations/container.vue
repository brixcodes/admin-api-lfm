<script lang="ts" setup>
import Evaluations from '@/pages/formations/evaluations.vue'
import Index from '@/pages/formations/index.vue'
import Modules from '@/pages/formations/modules.vue'
import Ressources from '@/pages/formations/ressources.vue'

import { useRoute } from 'vue-router'
const route = useRoute()
const activeTab = ref((route.query.tab as string) || 'index')

watch(activeTab, val => {
  const q = new URLSearchParams(route.query as any)
  q.set('tab', val)
  history.replaceState(null, '', `${route.path}?${q.toString()}`)
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

