<script lang="ts" setup>
import VerticalNavSectionTitle from '@/@layouts/components/VerticalNavSectionTitle.vue'
import VerticalNavGroup from '@layouts/components/VerticalNavGroup.vue'
import VerticalNavLink from '@layouts/components/VerticalNavLink.vue'
import { useAuth } from '@/utils/auth'
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
  <VerticalNavLink
    :item="{
      title: 'Tableau de bord',
      icon: 'ri-dashboard-line',
      to: '/dashboard',
    }"
  />

  <!-- 👉 Gestion des Apprenants -->
  <VerticalNavGroup
    :item="{
      title: 'Apprenants',
      icon: 'ri-user-star-line',
    }"
  >
    <VerticalNavLink
      :item="{
        title: 'Liste complète',
        to: '/apprenants',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Inscriptions',
        to: '/apprenants/inscriptions',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Parcours individuel',
        to: '/apprenants/parcours',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Chefs-d\'œuvre',
        to: '/apprenants/chefs-oeuvre',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Livret de compétences',
        to: '/apprenants/competences',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Accréditations',
        to: '/apprenants/accreditations',
      }"
    />
  </VerticalNavGroup>

  <!-- 👉 Formation et Pédagogie -->
  <VerticalNavGroup
    :item="{
      title: 'Formation',
      icon: 'ri-book-open-line',
    }"
  >
    <VerticalNavLink
      :item="{
        title: 'Modules de formation',
        to: '/formation/modules',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Supports pédagogiques',
        to: '/formation/supports',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Exercices et évaluations',
        to: '/formation/exercices',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Suivi des apprentissages',
        to: '/formation/suivi',
      }"
    />
  </VerticalNavGroup>

  <!-- 👉 Projets Pédagogiques -->
  <VerticalNavGroup
    :item="{
      title: 'Projets',
      icon: 'ri-folder-user-line',
    }"
  >
    <VerticalNavLink
      :item="{
        title: 'Chefs-d\'œuvre individuels',
        to: '/projets/chefs-oeuvre',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Projets collectifs',
        to: '/projets/collectifs',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Équipes de travail',
        to: '/projets/equipes',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Archives des réalisations',
        to: '/projets/archives',
      }"
    />
  </VerticalNavGroup>

  <!-- 👉 Interventions Sociales -->
  <VerticalNavGroup
    :item="{
      title: 'Interventions',
      icon: 'ri-heart-line',
    }"
  >
    <VerticalNavLink
      :item="{
        title: 'Stages en milieu carcéral',
        to: '/interventions/stages',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Missions humanitaires',
        to: '/interventions/humanitaires',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Partenaires associatifs',
        to: '/interventions/partenaires',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Rapports d\'intervention',
        to: '/interventions/rapports',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Cartographie des actions',
        to: '/interventions/cartographie',
      }"
    />
  </VerticalNavGroup>

  <!-- 👉 Équipe Pédagogique -->
  <VerticalNavGroup
    :item="{
      title: 'Formateurs',
      icon: 'ri-user-settings-line',
    }"
  >
    <VerticalNavLink
      :item="{
        title: 'Équipe pédagogique',
        to: '/formateurs',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Planning des interventions',
        to: '/formateurs/planning',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Suivi d\'activité',
        to: '/formateurs/activite',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Communication interne',
        to: '/formateurs/communication',
      }"
    />
  </VerticalNavGroup>

  <!-- 👉 Administration -->
  <VerticalNavGroup
    :item="{
      title: 'Administration',
      icon: 'ri-file-list-3-line',
    }"
  >
    <VerticalNavLink
      :item="{
        title: 'Dossiers administratifs',
        to: '/admin/dossiers',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Documents officiels',
        to: '/admin/documents',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Gestion des absences',
        to: '/admin/absences',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Discipline et sanctions',
        to: '/admin/discipline',
      }"
    />
  </VerticalNavGroup>

  <!-- 👉 Gestion Financière -->
  <VerticalNavGroup
    :item="{
      title: 'Finances',
      icon: 'ri-bank-card-line',
    }"
  >
    <VerticalNavLink
      :item="{
        title: 'Gestion des paiements',
        to: '/finances/paiements',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Forfaits de formation',
        to: '/finances/forfaits',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Sessions présentiel',
        to: '/finances/presentiel',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Logistique et transport',
        to: '/finances/logistique',
      }"
    />
  </VerticalNavGroup>

  <!-- 👉 Système -->
  <VerticalNavGroup
    :item="{
      title: 'Système',
      icon: 'ri-settings-3-line',
    }"
  >
    <VerticalNavLink
      :item="{
        title: 'Gestion des utilisateurs',
        to: '/system/utilisateurs',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Rôles et permissions',
        to: '/system/roles',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Sécurité et audit',
        to: '/system/securite',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Journal d\'activité',
        to: '/system/journal',
      }"
    />
  </VerticalNavGroup>

  <!-- 👉 Communication -->
  <VerticalNavGroup
    :item="{
      title: 'Communication',
      icon: 'ri-message-3-line',
    }"
  >
    <VerticalNavLink
      :item="{
        title: 'Site web institutionnel',
        to: '/communication/site',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Blog et actualités',
        to: '/communication/blog',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Médias et ressources',
        to: '/communication/medias',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Notifications',
        to: '/communication/notifications',
      }"
    />
  </VerticalNavGroup>

  <!-- 👉 Documentation -->
  <VerticalNavLink
    :item="{
      title: 'Documentation',
      icon: 'ri-article-line',
      to: '/documentation',
    }"
  />

  <!-- 👉 Déconnexion -->
  <VerticalNavLink
    :item="{
      title: 'Déconnexion',
      icon: 'ri-logout-box-r-line',
      to: '#',
    }"
    @click="handleLogout"
  />

</template>
