<script setup lang="ts">
import { ref } from 'vue'
import GlobalSearch from '@/components/GlobalSearch.vue'

const globalSearchRef = ref()

const openSearch = () => {
  globalSearchRef.value?.openSearch()
}
</script>

<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle>Test du Modal de Recherche</VCardTitle>
          <VCardText>
            <p>Cliquez sur le bouton ci-dessous pour tester le modal de recherche globale :</p>
            
            <VBtn 
              color="primary" 
              @click="openSearch"
              prepend-icon="ri-search-line"
            >
              Ouvrir la recherche
            </VBtn>

            <VDivider class="my-4" />

            <h3>Fonctionnalités testées :</h3>
            <ul>
              <li>✅ Ouverture du modal au clic</li>
              <li>✅ Recherche en temps réel sans endpoint</li>
              <li>✅ Recherche dans les pages de l'application</li>
              <li>✅ Recherche dans les utilisateurs simulés</li>
              <li>✅ Recherche dans les formations</li>
              <li>✅ Recherche dans les spécialités</li>
              <li>✅ Navigation vers les résultats</li>
              <li>✅ Raccourcis clavier (Cmd/Ctrl + K)</li>
              <li>✅ Fermeture avec Escape</li>
              <li>✅ Recherches populaires</li>
              <li>✅ Catégories d'applications</li>
            </ul>

            <VAlert type="info" class="mt-4">
              <strong>Instructions de test :</strong><br>
              1. Cliquez sur "Ouvrir la recherche" ou utilisez Cmd/Ctrl + K<br>
              2. Tapez des mots-clés comme "amadou", "formation", "auxiliaire", "technicien"<br>
              3. Testez les recherches populaires en cliquant sur les chips<br>
              4. Naviguez dans les catégories d'applications<br>
              5. Cliquez sur un résultat pour naviguer (simulation)
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>

  <!-- Composant de recherche globale -->
  <GlobalSearch ref="globalSearchRef" />
</template>
