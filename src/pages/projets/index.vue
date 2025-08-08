<script lang="ts" setup>
import Chefs from '@/pages/projets/chefs-doeuvre.vue'
import Collectifs from '@/pages/projets/collectifs.vue'

const activeTab = ref('chefs')
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

