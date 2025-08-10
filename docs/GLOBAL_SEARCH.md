# Modal de Recherche Globale

## Description

Le modal de recherche globale permet aux utilisateurs de rechercher rapidement dans toute l'application sans avoir besoin d'endpoints backend. Il fonctionne entièrement en frontend avec des données simulées.

## Fonctionnalités

### ✅ Recherche en temps réel
- Recherche instantanée sans délai
- Filtrage intelligent par mots-clés
- Recherche dans plusieurs catégories simultanément

### ✅ Catégories de recherche
1. **Pages de l'application** - Navigation rapide vers les différentes sections
2. **Utilisateurs** - Recherche par nom, prénom, email, rôle
3. **Formations** - Recherche dans les formations et modules
4. **Spécialités** - Recherche dans les spécialités de formation

### ✅ Interface utilisateur
- Design moderne avec backdrop blur
- Animations fluides
- Responsive design
- Support des thèmes clair/sombre

### ✅ Raccourcis clavier
- `Cmd/Ctrl + K` : Ouvrir la recherche
- `Escape` : Fermer la recherche
- `↑↓` : Navigation dans les résultats
- `Enter` : Sélectionner un résultat

### ✅ Recherches populaires
- Chips cliquables pour les recherches fréquentes
- Catégories d'applications organisées
- Navigation rapide vers les sections principales

## Utilisation

### Intégration dans un layout

```vue
<script setup lang="ts">
import GlobalSearch from '@/components/GlobalSearch.vue'
import { ref } from 'vue'

const globalSearchRef = ref()

const openGlobalSearch = () => {
  globalSearchRef.value?.openSearch()
}
</script>

<template>
  <!-- Bouton de déclenchement -->
  <div @click="openGlobalSearch">
    <VIcon icon="ri-search-line" />
    <span>Rechercher</span>
  </div>

  <!-- Composant de recherche -->
  <GlobalSearch ref="globalSearchRef" />
</template>
```

### Personnalisation des données

Les données de recherche sont définies dans le composant `GlobalSearch.vue` dans l'objet `staticData`. Vous pouvez facilement :

1. **Ajouter de nouvelles pages** :
```javascript
{
  title: 'Nouvelle Page',
  description: 'Description de la page',
  path: '/nouvelle-page',
  icon: 'ri-icon-name',
  category: 'category',
  keywords: ['mot1', 'mot2', 'mot3']
}
```

2. **Ajouter des utilisateurs** :
```javascript
{
  id: 4,
  nom: 'Nom',
  prenom: 'Prénom',
  email: 'email@example.com',
  role: 'Rôle utilisateur',
  specialty: 'Spécialité',
  keywords: ['mots', 'clés', 'recherche']
}
```

3. **Ajouter des formations** :
```javascript
{
  id: 4,
  titre: 'Titre de la formation',
  description: 'Description détaillée',
  duree: 'Durée',
  lieu: 'Lieu',
  keywords: ['formation', 'mots', 'clés']
}
```

## Traductions

Le composant utilise Vue I18n pour les traductions. Les clés disponibles :

```json
{
  "search": {
    "placeholder": "Rechercher dans l'application...",
    "no_results": "Aucun résultat trouvé",
    "popular_searches": "RECHERCHES POPULAIRES",
    "apps_pages": "APPS & PAGES",
    "results": {
      "pages": "Pages",
      "users": "Utilisateurs",
      "formations": "Formations",
      "specialties": "Spécialités"
    },
    "shortcuts": {
      "navigate": "Naviguez avec ↑↓",
      "select": "pour sélectionner",
      "close": "pour fermer"
    }
  }
}
```

## Styles CSS

Le composant utilise des CSS variables Vuetify pour s'adapter automatiquement aux thèmes :

- `--v-theme-surface` : Couleur de surface
- `--v-theme-primary` : Couleur primaire
- Backdrop blur pour un effet moderne
- Transitions fluides pour les interactions

## Test

Une page de test est disponible à `/test-search` pour tester toutes les fonctionnalités :

1. Ouverture du modal
2. Recherche en temps réel
3. Navigation dans les résultats
4. Raccourcis clavier
5. Recherches populaires

## Évolutions futures

### Possibles améliorations :
1. **Recherche avancée** avec filtres
2. **Historique de recherche** local
3. **Suggestions automatiques** basées sur l'usage
4. **Recherche dans le contenu** des pages
5. **Intégration avec des APIs** réelles
6. **Recherche vocale** avec Web Speech API
7. **Recherche par catégorie** avec onglets

### Intégration backend :
Quand les APIs seront disponibles, il suffira de remplacer les données statiques par des appels API dans la fonction `searchResults` computed.

## Architecture

```
src/
├── components/
│   └── GlobalSearch.vue          # Composant principal
├── layouts/components/
│   └── DefaultLayoutWithVerticalNav.vue  # Intégration dans le layout
├── locales/
│   ├── fr.json                   # Traductions françaises
│   └── en.json                   # Traductions anglaises
├── pages/
│   └── test-search.vue           # Page de test
└── docs/
    └── GLOBAL_SEARCH.md          # Cette documentation
```

Le composant est autonome et peut être facilement intégré dans n'importe quel layout ou page de l'application.
