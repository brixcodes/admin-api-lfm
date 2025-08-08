<script lang="ts" setup>
import Individuel from '@/pages/genetique/individuel.vue'
import Ascendance from '@/pages/genetique/ascendance.vue'
import Sante from '@/pages/genetique/sante.vue'
import Education from '@/pages/genetique/education.vue'
import PII from '@/pages/genetique/plan-intervention.vue'

const activeTab = ref('individuel')
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

