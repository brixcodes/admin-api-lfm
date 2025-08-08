<script lang="ts" setup>
import Accreditations from '@/pages/accreditations.vue'
import Actualites from '@/pages/actualites.vue'

import { useRoute } from 'vue-router'
const route = useRoute()
const activeTab = ref((route.query.tab as string) || 'actualites')

watch(activeTab, val => {
  const q = new URLSearchParams(route.query as any)
  q.set('tab', val)
  history.replaceState(null, '', `${route.path}?${q.toString()}`)
})
const tabs = [
  { title: 'Actualités', icon: 'ri-newspaper-line', tab: 'actualites', component: Actualites },
  { title: 'Accréditations', icon: 'ri-shield-check-line', tab: 'accreditations', component: Accreditations },
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

