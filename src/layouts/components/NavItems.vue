<script lang="ts" setup>
import { useAuth } from '@/utils/auth'
import VerticalNavLink from '@layouts/components/VerticalNavLink.vue'
import { useRouter } from 'vue-router'

const { logout } = useAuth()
const router = useRouter()

// Fonction de déconnexion
const handleLogout = async () => {
  try {
    await logout()
    router.push('/login')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    // Redirection forcée vers la page de connexion
    router.push('/login')
  }
}
</script>

<template>
  <!-- 👉 Tableau de bord -->
  <VerticalNavLink :item="{ title: $t('nav.dashboard'), icon: 'ri-dashboard-line', to: '/dashboard' }" />

  <!-- 👉 Profil -->
  <VerticalNavLink :item="{ title: $t('nav.profile'), icon: 'ri-user-settings-line', to: '/profil' }" />

  <!-- 👉 Utilisateurs -->
  <VerticalNavLink :item="{ title: $t('nav.users'), icon: 'ri-user-3-line', to: '/system' }" />

  <!-- 👉 Formations -->
  <VerticalNavLink :item="{ title: $t('nav.trainings'), icon: 'ri-book-open-line', to: '/formations' }" />

  <!-- 👉 Gestion -->
  <VerticalNavLink :item="{ title: $t('nav.management'), icon: 'ri-briefcase-3-line', to: '/gestion' }" />

  <!-- 👉 Projets -->
  <VerticalNavLink :item="{ title: $t('nav.projects'), icon: 'ri-team-line', to: '/projets' }" />


  <!-- 👉 Fichiers -->
  <VerticalNavLink :item="{ title: $t('nav.files'), icon: 'ri-folder-3-line', to: '/fichiers' }" />

  <!-- 👉 Informations -->
  <VerticalNavLink :item="{ title: $t('nav.infos'), icon: 'ri-megaphone-line', to: '/infos' }" />

  <!-- 👉 Déconnexion -->
  <VerticalNavLink :item="{ title: 'Déconnexion', icon: 'ri-logout-box-r-line', }" @click="handleLogout" />
</template>
