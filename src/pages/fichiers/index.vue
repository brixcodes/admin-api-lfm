<script lang="ts" setup>
import Audios from '@/pages/fichiers/audios.vue'
import Documents from '@/pages/fichiers/documents.vue'
import Images from '@/pages/fichiers/images.vue'
import Videos from '@/pages/fichiers/videos.vue'

import { useRoute } from 'vue-router'
const route = useRoute()
const activeTab = ref((route.query.tab as string) || 'documents')

watch(activeTab, val => {
  const q = new URLSearchParams(route.query as any)
  q.set('tab', val)
  history.replaceState(null, '', `${route.path}?${q.toString()}`)
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

