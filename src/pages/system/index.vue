<script lang="ts" setup>
import Journal from '@/pages/system/journal.vue'
import Roles from '@/pages/system/roles.vue'
import Utilisateurs from '@/pages/system/utilisateurs.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeTab = ref((route.query.tab as string) || 'utilisateurs')

watch(activeTab, val => {
  const q = new URLSearchParams(route.query as any)
  q.set('tab', val)
  history.replaceState(null, '', `${route.path}?${q.toString()}`)
})

const tabs = [
  { title: 'Utilisateurs', icon: 'ri-user-3-line', tab: 'utilisateurs', component: Utilisateurs },
  { title: 'Rôles', icon: 'ri-shield-keyhole-line', tab: 'roles', component: Roles },
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

