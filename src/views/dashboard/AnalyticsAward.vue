<script setup lang="ts">
import { useUserProfile } from '@/composables/useUserProfile'
import wavingHand from '@images/misc/hello.png'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { user, fetchUserProfile } = useUserProfile()

// Utiliser les traductions au lieu des objets en dur
const welcome = computed(() => ({
  title: t('dashboard.welcome.title'),
  message: t('dashboard.welcome.message'),
  actionLabel: t('dashboard.welcome.actionLabel'),
  link: '/apropos',
}))

// Charger les données utilisateur au montage
onMounted(async () => {
  await fetchUserProfile()
})
</script>

<template>
  <VCard class="position-relative overflow-hidden">
    <VCardText>
      <div class="mb-2">
        <h5 class="text-h5">{{ welcome.title }}</h5>
        <div class="text-body-1 mb-3" style="white-space: pre-line;">
          {{ welcome.message }}
        </div>

        <!-- Display full name + role / Affichage du nom complet + rôle -->
        <h4 class="text-h4 text-primary">
          {{ user?.prenom }} {{ user?.nom }}
        </h4>
        <div class="text-body-1 mb-2">
          {{ user?.role?.nom }}
        </div>

        <VBtn :to="welcome.link" color="primary" size="small">
          {{ welcome.actionLabel }}
        </VBtn>
      </div>
    </VCardText>

    <VImg :src="wavingHand" class="welcome-icon" />
  </VCard>
</template>

<style lang="scss" scoped>
.v-card .welcome-icon {
  position: absolute;
  inline-size: 6rem;
  inset-block-end: 1.25rem;
  inset-inline-end: 1.25rem;
  opacity: 0.8;
}
</style>
