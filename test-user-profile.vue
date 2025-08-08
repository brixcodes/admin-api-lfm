<template>
  <div>
    <h2>Test du composable useUserProfile</h2>
    
    <div v-if="isLoading">
      <p>Chargement des données utilisateur...</p>
    </div>
    
    <div v-else-if="error">
      <p style="color: red">Erreur: {{ error }}</p>
    </div>
    
    <div v-else-if="user">
      <h3>Données utilisateur récupérées :</h3>
      <ul>
        <li><strong>Nom complet:</strong> {{ fullName }}</li>
        <li><strong>Email:</strong> {{ user.email }}</li>
        <li><strong>Rôle:</strong> {{ displayRole }}</li>
        <li><strong>Statut:</strong> {{ user.statut }}</li>
        <li><strong>Actif:</strong> {{ isActive ? 'Oui' : 'Non' }}</li>
        <li><strong>Date de création:</strong> {{ user.created_at }}</li>
      </ul>
      
      <h4>Permissions:</h4>
      <ul>
        <li v-for="permission in user.permissions" :key="permission.id">
          {{ permission.nom }}
        </li>
      </ul>
    </div>
    
    <div v-else>
      <p>Aucune donnée utilisateur disponible</p>
    </div>
    
    <button @click="fetchUserProfile">Recharger les données</button>
  </div>
</template>

<script setup lang="ts">
import { useUserProfile } from '@/composables/useUserProfile'

const { 
  user, 
  isLoading, 
  error, 
  fullName, 
  displayRole, 
  isActive, 
  fetchUserProfile 
} = useUserProfile()

// Charger les données au montage
onMounted(() => {
  fetchUserProfile()
})
</script>
