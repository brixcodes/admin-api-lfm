import { UsersApi } from '@/utils/services'
import type { Utilisateur } from '@/utils/types/models'
import { computed, ref } from 'vue'

// Utiliser le proxy en développement, l'URL complète en production
const API_BASE_URL = import.meta.env.DEV ? '/api' : 'https://lafaom-mao.vertex-cam.com'

export const useUserProfile = () => {
  const user = ref<Utilisateur | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties pour faciliter l'accès aux données
  const fullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.prenom || ''} ${user.value.nom || ''}`.trim()
  })

  const displayRole = computed(() => {
    return user.value?.role?.nom || ''
  })

  const isActive = computed(() => {
    return user.value?.est_actif || false
  })

  /**
   * Récupère les données de l'utilisateur connecté depuis l'API
   */
  const fetchUserProfile = async (): Promise<void> => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      error.value = 'Token d\'authentification manquant'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      // Utilisation de l'URL complète comme dans le code existant
      const response = await fetch(`${API_BASE_URL}/users/me?token=${token}`, {
        headers: {
          'accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const userData = await response.json()
      user.value = userData
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la récupération du profil'
      console.error('Erreur lors de la récupération du profil utilisateur:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Met à jour le profil utilisateur
   */
  const updateUserProfile = async (updateData: Partial<Utilisateur>): Promise<void> => {
    if (!user.value) {
      error.value = 'Aucun utilisateur connecté'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const updatedUser = await UsersApi.updateProfile(user.value.id, updateData)
      user.value = updatedUser
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la mise à jour du profil'
      console.error('Erreur lors de la mise à jour du profil:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Réinitialise les données utilisateur
   */
  const clearUserProfile = (): void => {
    user.value = null
    error.value = null
    isLoading.value = false
  }

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  const hasPermission = (permissionName: string): boolean => {
    if (!user.value?.permissions) return false
    return user.value.permissions.some(permission => permission.nom === permissionName)
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  const hasRole = (roleName: string): boolean => {
    return user.value?.role?.nom === roleName
  }

  return {
    // State
    user: readonly(user),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Computed
    fullName,
    displayRole,
    isActive,
    
    // Methods
    fetchUserProfile,
    updateUserProfile,
    clearUserProfile,
    hasPermission,
    hasRole,
  }
}
