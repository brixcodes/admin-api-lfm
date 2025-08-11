import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: number
  email: string
  nom: string
  prenom: string
  role: string
  permissions: string[]
}

export const useAuthStore = defineStore('auth', () => {
  // État
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userId = computed(() => user.value?.id || null)
  const userFullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.prenom} ${user.value.nom}`
  })

  // Actions
  const setUser = (userData: User) => {
    user.value = userData
  }

  const setToken = (authToken: string) => {
    token.value = authToken
    localStorage.setItem('auth_token', authToken)
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
  }

  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      // Simulation d'une connexion - à remplacer par l'API réelle
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Erreur de connexion')
      }

      const data = await response.json()
      setToken(data.token)
      setUser(data.user)

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }
    } finally {
      isLoading.value = false
    }
  }

  // Initialisation avec un utilisateur fictif pour le développement
  const initDemoUser = () => {
    if (!user.value) {
      setUser({
        id: 1,
        email: 'admin@lafaom-mao.com',
        nom: 'Admin',
        prenom: 'Super',
        role: 'admin',
        permissions: ['create_actualites', 'edit_actualites', 'delete_actualites']
      })
    }
  }

  // Auto-initialisation pour le développement
  if (token.value && !user.value) {
    initDemoUser()
  }

  return {
    // État
    user,
    token,
    isLoading,
    
    // Getters
    isAuthenticated,
    userId,
    userFullName,
    
    // Actions
    setUser,
    setToken,
    logout,
    login,
    initDemoUser,
  }
})
