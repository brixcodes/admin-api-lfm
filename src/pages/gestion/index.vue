<script lang="ts" setup>
import Inscriptions from '@/pages/inscriptions/index.vue'
import Paiements from '@/pages/paiements/index.vue'

const activeTab = ref('inscriptions')
const tabs = [
  { title: 'Inscriptions', icon: 'ri-file-add-line', tab: 'inscriptions', component: Inscriptions },
  { title: 'Paiements', icon: 'ri-bill-line', tab: 'paiements', component: Paiements },
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

