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
  <VerticalNavLink :item="{ title: 'Tableau de bord', icon: 'ri-dashboard-line', to: '/dashboard' }" />

  <!-- 👉 Utilisateurs -->
  <VerticalNavLink :item="{ title: 'Utilisateurs', icon: 'ri-user-3-line', to: '/system' }" />

  <!-- 👉 Formations -->
  <VerticalNavLink :item="{ title: 'Formations', icon: 'ri-book-open-line', to: '/formations' }" />

  <!-- 👉 Inscriptions & Paiements -->
  <VerticalNavLink :item="{ title: 'Inscriptions & Paiements', icon: 'ri-bill-line', to: '/gestion' }" />

  <!-- 👉 Projets -->
  <VerticalNavLink :item="{ title: 'Projets', icon: 'ri-team-line', to: '/projets' }" />

  <!-- 👉 Génétique -->
  <VerticalNavLink :item="{ title: 'Génétique', icon: 'ri-service-line', to: '/genetique' }" />

  <!-- 👉 Fichiers -->
  <VerticalNavLink :item="{ title: 'Fichiers', icon: 'ri-folder-3-line', to: '/fichiers' }" />

  <!-- 👉 Informations -->
  <VerticalNavLink :item="{ title: 'Informations', icon: 'ri-megaphone-line', to: '/infos' }" />

  <!-- 👉 Déconnexion -->
  <VerticalNavLink :item="{ title: 'Déconnexion', icon: 'ri-logout-box-r-line', }" @click="handleLogout" />
</template>
