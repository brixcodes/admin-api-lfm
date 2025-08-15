<script lang="ts" setup>
import AccountSettingsAccount from '@/views/pages/account-settings/AccountSettingsAccount.vue'
import AccountSettingsSecurity from '@/views/pages/account-settings/AccountSettingsSecurity.vue'
import { useRoute } from 'vue-router'

// Intégration des sections Génétique dans Profil
import GenAscendance from '@/pages/genetique/ascendance.vue'
import GenEducation from '@/pages/genetique/education.vue'
import GenIndividuel from '@/pages/genetique/individuel.vue'
import GenPII from '@/pages/genetique/plan-intervention.vue'
import GenSante from '@/pages/genetique/sante.vue'

const route = useRoute()

const activeTab = ref(route.params.tab || 'account')

// tabs
const tabs = [
  { title: 'Account', icon: 'ri-group-line', tab: 'account' },
  { title: 'Security', icon: 'ri-lock-line', tab: 'security' },

  // Génétique intégrée
  { title: 'Individuel', icon: 'ri-user-3-line', tab: 'gen-individuel' },
  { title: 'Ascendance', icon: 'ri-family-line', tab: 'gen-ascendance' },
  { title: 'Santé', icon: 'ri-heart-pulse-line', tab: 'gen-sante' },
  { title: 'Éducation', icon: 'ri-graduation-cap-line', tab: 'gen-education' },
  { title: 'PII', icon: 'ri-clipboard-line', tab: 'gen-pii' },
]
</script>

<template>
  <div>
    <VTabs v-model="activeTab" show-arrows class="v-tabs-pill">
      <VTab v-for="item in tabs" :key="item.icon" :value="item.tab">
        <VIcon size="20" start :icon="item.icon" />
        {{ item.title }}
      </VTab>
    </VTabs>

    <VWindow v-model="activeTab" class="mt-5 disable-tab-transition" :touch="false">
      <!-- Account -->
      <VWindowItem value="account">
        <AccountSettingsAccount />
      </VWindowItem>

      <!-- Security -->
      <VWindowItem value="security">
        <AccountSettingsSecurity />
      </VWindowItem>



      <!-- Génétique: Individuel -->
      <VWindowItem value="gen-individuel">
        <GenIndividuel />
      </VWindowItem>

      <!-- Génétique: Ascendance -->
      <VWindowItem value="gen-ascendance">
        <GenAscendance />
      </VWindowItem>

      <!-- Génétique: Santé -->
      <VWindowItem value="gen-sante">
        <GenSante />
      </VWindowItem>

      <!-- Génétique: Éducation -->
      <VWindowItem value="gen-education">
        <GenEducation />
      </VWindowItem>

      <!-- Génétique: PII -->
      <VWindowItem value="gen-pii">
        <GenPII />
      </VWindowItem>
    </VWindow>
  </div>
</template>
