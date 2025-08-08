export const routes = [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/',
    component: () => import('@/layouts/default.vue'),
    children: [
      { path: 'dashboard', component: () => import('@/pages/dashboard.vue') },

      // Utilisateurs & Système
      { path: 'system', component: () => import('@/pages/system/index.vue') },

      // Formations
      { path: 'formations', component: () => import('@/pages/formations/container.vue') },

      // Inscriptions & Paiements
      { path: 'gestion', component: () => import('@/pages/gestion/index.vue') },

      // Projets
      { path: 'projets', component: () => import('@/pages/projets/index.vue') },

      // Génétique
      { path: 'genetique', component: () => import('@/pages/genetique/index.vue') },

      // Accréditations & Actualités
      { path: 'infos', component: () => import('@/pages/infos/index.vue') },

      // Fichiers
      { path: 'fichiers', component: () => import('@/pages/fichiers/index.vue') },

      // Paramètres de compte (exemple d’UI tabulée)
      { path: 'account-settings', component: () => import('@/pages/account-settings.vue') },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/blank.vue'),
    children: [
      { path: 'login', component: () => import('@/pages/login.vue') },
      { path: 'register', component: () => import('@/pages/register.vue') },
      { path: 'forgot-password', component: () => import('@/pages/forgot-password.vue') },
      { path: 'change-password', component: () => import('@/pages/change-password.vue') },
      { path: '/:pathMatch(.*)*', component: () => import('@/pages/[...error].vue') },
    ],
  },
]
