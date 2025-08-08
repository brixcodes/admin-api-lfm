<script lang="ts" setup>
import { useRoute } from 'vue-router'
import Utilisateurs from '@/pages/system/utilisateurs.vue'
import Roles from '@/pages/system/roles.vue'
import Journal from '@/pages/system/journal.vue'

const route = useRoute()
const activeTab = ref((route.params.tab as string) || 'utilisateurs')

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

