import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authService } from '@/utils/auth'

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
  const token = ref<string | null>(localStorage.getItem('authToken'))
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userId = computed(() => user.value?.id || null)

  const userFullName = computed(() => {
    if (!user.value)
      return ''

    return `${user.value.prenom} ${user.value.nom}`
  })

  // Actions
  const setUser = (userData: User) => {
    user.value = userData
  }

  const setToken = (authToken: string) => {
    token.value = authToken
    localStorage.setItem('authToken', authToken) // Utiliser la même clé que le service d'auth
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('authToken') // Utiliser la même clé que le service d'auth
  }

  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      // Simulation d'une connexion - à remplacer par l'API réelle
      const response = await fetch('https://lafaom-mao.vertex-cam.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok)
        throw new Error('Erreur de connexion')

      const data = await response.json()

      setToken(data.token)
      setUser(data.user)

      return { success: true }
    }
    catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }
    }
    finally {
      isLoading.value = false
    }
  }

  // Récupérer l'utilisateur connecté depuis l'API
  const fetchCurrentUser = async () => {
    if (!token.value)
      return null

    try {
      const response = await fetch(`https://lafaom-mao.vertex-cam.com/users/me?token=${token.value}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })

      if (response.ok) {
        const userData = await response.json()

        console.log('Données utilisateur récupérées:', userData)

        setUser({
          id: userData.id,
          email: userData.email,
          nom: userData.nom,
          prenom: userData.prenom,
          role: userData.role?.nom || 'user',
          permissions: userData.permissions?.map((p: any) => p.nom) || [],
        })

        return userData
      }
      else {
        console.error('Erreur API:', response.status, response.statusText)
      }
    }
    catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    }

    return null
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
        permissions: ['create_actualites', 'edit_actualites', 'delete_actualites'],
      })
    }
  }

  // Auto-initialisation - essayer de récupérer l'utilisateur connecté
  if (token.value && !user.value) {
    fetchCurrentUser().catch(() => {
      // Si l'API échoue, utiliser l'utilisateur démo en développement
      console.log('Impossible de récupérer l\'utilisateur connecté, utilisation de l\'utilisateur démo')
      initDemoUser()
    })
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
    fetchCurrentUser,
    initDemoUser,
  }
})
