<script lang="ts" setup>
import { useUserProfile } from '@/composables/useUserProfile'
import AccountSettingsAccount from '@/views/pages/account-settings/AccountSettingsAccount.vue'
import AccountSettingsSecurity from '@/views/pages/account-settings/AccountSettingsSecurity.vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

// Intégration des sections Génétique dans Profil
import GenAscendance from '@/pages/genetique/ascendance.vue'
import GenEducation from '@/pages/genetique/education.vue'
import GenIndividuel from '@/pages/genetique/individuel.vue'
import GenPII from '@/pages/genetique/plan-intervention.vue'
import GenSante from '@/pages/genetique/sante.vue'

const route = useRoute()
const { t } = useI18n()
const { fetchUserProfile } = useUserProfile()

const activeTab = ref(route.params.tab || 'profil')

// tabs avec traductions
const tabs = computed(() => [
  { title: t('profile.tabs.profile'), icon: 'ri-group-line', tab: 'profil' },
  { title: t('profile.tabs.security'), icon: 'ri-lock-line', tab: 'security' },

  // Génétique intégrée
  { title: t('profile.tabs.gen_individual'), icon: 'ri-user-3-line', tab: 'gen-individuel' },
  { title: t('profile.tabs.gen_ancestry'), icon: 'ri-family-line', tab: 'gen-ascendance' },
  { title: t('profile.tabs.gen_health'), icon: 'ri-heart-pulse-line', tab: 'gen-sante' },
  { title: t('profile.tabs.gen_education'), icon: 'ri-graduation-cap-line', tab: 'gen-education' },
  { title: t('profile.tabs.gen_pii'), icon: 'ri-clipboard-line', tab: 'gen-pii' },
])

// Charger les données utilisateur au montage
onMounted(async () => {
  await fetchUserProfile()
})
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
      <!-- Profil -->
      <VWindowItem value="profil">
        <AccountSettingsAccount />
      </VWindowItem>

      <!-- Sécurité -->
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
