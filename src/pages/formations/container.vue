<script lang="ts" setup>
import Index from '@/pages/formations/index.vue'
import Modules from '@/pages/formations/modules.vue'
import Ressources from '@/pages/formations/ressources.vue'
import Evaluations from '@/pages/formations/evaluations.vue'

const activeTab = ref('index')
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

