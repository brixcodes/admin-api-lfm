// Service d'authentification pour LAFAOM-MAO
const API_BASE_URL = 'http://localhost:8000'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  nom: string
  prenom: string
  sexe: 'homme' | 'femme'
  email: string
  role_name: 'admin' | 'coordonnateur' | 'formateur' | 'referent' | 'apprenant'
}

export interface ForgotPasswordCredentials {
  email: string
}

export interface LoginResponse {
  token: string
  user?: {
    id: number
    email: string
    name: string
    role: string
  }
  message?: string
}

export interface RegisterResponse {
  user: {
    id: number
    nom: string
    prenom: string
    sexe: string
    email: string
    role_name: string
  }
  message?: string
}

export interface ForgotPasswordResponse {
  message: string
}

export interface AuthError {
  message: string
  status?: number
}

class AuthService {
  private token: string | null = null

  constructor() {
    // Récupérer le token du localStorage au démarrage
    this.token = localStorage.getItem('authToken')
  }

  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Gestion spécifique selon le code de statut
        switch (response.status) {
          case 401:
            throw {
              message: errorData.message || 'Email ou mot de passe incorrect',
              status: response.status
            } as AuthError
          case 422:
            throw {
              message: errorData.message || 'Données de connexion invalides',
              status: response.status
            } as AuthError
          case 500:
            throw {
              message: 'Erreur interne du serveur. Veuillez réessayer plus tard.',
              status: response.status
            } as AuthError
          case 503:
            throw {
              message: 'Service temporairement indisponible. Veuillez réessayer.',
              status: response.status
            } as AuthError
          default:
            throw {
              message: errorData.message || `Erreur de connexion (${response.status})`,
              status: response.status
            } as AuthError
        }
      }

      const data: any = await response.json()
      
      // Accepte 'token' ou 'access_token' comme clé du JWT
      const token = data.token || data.access_token
      if (token) {
        this.setToken(token)
        // On retourne le même objet mais on ajoute 'token' pour la cohérence du frontend
        return { ...data, token }
      } else {
        throw { message: 'Réponse invalide du serveur - token manquant' } as AuthError
      }
    } catch (error) {
      // Gestion des erreurs de réseau
      if (error instanceof TypeError) {
        throw { 
          message: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet et que le serveur est démarré.' 
        } as AuthError
      }
      
      // Si c'est déjà une AuthError, la relancer
      if (error && typeof error === 'object' && 'message' in error) {
        throw error
      }
      
      // Erreur générique
      throw { 
        message: 'Une erreur inattendue s\'est produite lors de la connexion' 
      } as AuthError
    }
  }

  /**
   * Inscription utilisateur
   */
  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Gestion spécifique selon le code de statut
        switch (response.status) {
          case 400:
            throw {
              message: errorData.message || 'Données d\'inscription invalides',
              status: response.status
            } as AuthError
          case 409:
            throw {
              message: errorData.message || 'Un utilisateur avec cet email existe déjà',
              status: response.status
            } as AuthError
          case 422:
            throw {
              message: errorData.message || 'Données de formulaire invalides',
              status: response.status
            } as AuthError
          case 500:
            throw {
              message: 'Erreur interne du serveur. Veuillez réessayer plus tard.',
              status: response.status
            } as AuthError
          case 503:
            throw {
              message: 'Service temporairement indisponible. Veuillez réessayer.',
              status: response.status
            } as AuthError
          default:
            throw {
              message: errorData.message || `Erreur d'inscription (${response.status})`,
              status: response.status
            } as AuthError
        }
      }

      const data: RegisterResponse = await response.json()
      return data
    } catch (error) {
      // Gestion des erreurs de réseau
      if (error instanceof TypeError) {
        throw { 
          message: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet et que le serveur est démarré.' 
        } as AuthError
      }
      
      // Si c'est déjà une AuthError, la relancer
      if (error && typeof error === 'object' && 'message' in error) {
        throw error
      }
      
      // Erreur générique
      throw { 
        message: 'Une erreur inattendue s\'est produite lors de l\'inscription' 
      } as AuthError
    }
  }

  /**
   * Réinitialisation de mot de passe
   */
  async forgotPassword(credentials: ForgotPasswordCredentials): Promise<ForgotPasswordResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Gestion spécifique selon le code de statut
        switch (response.status) {
          case 404:
            throw {
              message: errorData.message || 'Aucun compte trouvé avec cette adresse email',
              status: response.status
            } as AuthError
          case 422:
            throw {
              message: errorData.message || 'Adresse email invalide',
              status: response.status
            } as AuthError
          case 429:
            throw {
              message: errorData.message || 'Trop de tentatives. Veuillez réessayer dans quelques minutes.',
              status: response.status
            } as AuthError
          case 500:
            throw {
              message: 'Erreur interne du serveur. Veuillez réessayer plus tard.',
              status: response.status
            } as AuthError
          case 503:
            throw {
              message: 'Service temporairement indisponible. Veuillez réessayer.',
              status: response.status
            } as AuthError
          default:
            throw {
              message: errorData.message || `Erreur de réinitialisation (${response.status})`,
              status: response.status
            } as AuthError
        }
      }

      const data: ForgotPasswordResponse = await response.json()
      return data
    } catch (error) {
      // Gestion des erreurs de réseau
      if (error instanceof TypeError) {
        throw { 
          message: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet et que le serveur est démarré.' 
        } as AuthError
      }
      
      // Si c'est déjà une AuthError, la relancer
      if (error && typeof error === 'object' && 'message' in error) {
        throw error
      }
      
      // Erreur générique
      throw { 
        message: 'Une erreur inattendue s\'est produite lors de la réinitialisation' 
      } as AuthError
    }
  }

  /**
   * Déconnexion utilisateur
   */
  async logout(): Promise<void> {
    try {
      if (this.token) {
        // Appel API de déconnexion si disponible
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {
          // Ignorer les erreurs de déconnexion
        })
      }
    } finally {
      this.clearAuth()
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return !!this.token
  }

  /**
   * Obtenir le token actuel
   */
  getToken(): string | null {
    return this.token
  }

  /**
   * Obtenir les informations utilisateur
   */
  getUserInfo(): any {
    const userInfo = localStorage.getItem('userInfo')
    return userInfo ? JSON.parse(userInfo) : null
  }

  /**
   * Définir le token et le sauvegarder
   */
  private setToken(token: string): void {
    this.token = token
    localStorage.setItem('authToken', token)
  }

  /**
   * Nettoyer les données d'authentification
   */
  private clearAuth(): void {
    this.token = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('rememberMe')
    // Ne pas supprimer redirectAfterLogin ici pour permettre la redirection après reconnexion
  }

  /**
   * Créer un header d'autorisation pour les requêtes API
   */
  getAuthHeaders(): Record<string, string> {
    return this.token ? {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    } : {
      'Content-Type': 'application/json',
    }
  }

  /**
   * Vérifier la validité du token (optionnel)
   */
  async validateToken(): Promise<boolean> {
    if (!this.token) return false

    try {
      const response = await fetch(`${API_BASE_URL}/validate-token`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Rafraîchir le token (si l'API le supporte)
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/refresh-token`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.token) {
          this.setToken(data.token)
          return true
        }
      }
      return false
    } catch {
      return false
    }
  }
}

// Instance singleton du service d'authentification
export const authService = new AuthService()

// Composable Vue pour l'authentification
export function useAuth() {
  const isAuthenticated = ref(authService.isAuthenticated())
  const userInfo = ref(authService.getUserInfo())
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const success = ref<string | null>(null)

  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true
    error.value = null
    success.value = null

    try {
      const response = await authService.login(credentials)
      isAuthenticated.value = true
      userInfo.value = response.user || null
      
      // Stocker les informations utilisateur si disponibles
      if (response.user) {
        localStorage.setItem('userInfo', JSON.stringify(response.user))
      }
      
      return response
    } catch (err: any) {
      // Afficher le message d'erreur spécifique
      error.value = err.message || 'Erreur de connexion inconnue'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    isLoading.value = true
    error.value = null
    success.value = null

    try {
      const response = await authService.register(credentials)
      return response
    } catch (err: any) {
      // Afficher le message d'erreur spécifique
      error.value = err.message || 'Erreur d\'inscription inconnue'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const forgotPassword = async (credentials: ForgotPasswordCredentials) => {
    isLoading.value = true
    error.value = null
    success.value = null

    try {
      const response = await authService.forgotPassword(credentials)
      success.value = response.message || 'Un email de réinitialisation a été envoyé à votre adresse email'
      return response
    } catch (err: any) {
      // Afficher le message d'erreur spécifique
      error.value = err.message || 'Erreur de réinitialisation inconnue'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true
    try {
      await authService.logout()
      isAuthenticated.value = false
      userInfo.value = null
    } finally {
      isLoading.value = false
    }
  }

  // Fonction pour effacer les erreurs et messages de succès
  const clearError = () => {
    error.value = null
    success.value = null
  }

  return {
    isAuthenticated: readonly(isAuthenticated),
    userInfo: readonly(userInfo),
    isLoading: readonly(isLoading),
    error: readonly(error),
    success: readonly(success),
    login,
    register,
    forgotPassword,
    logout,
    clearError,
  }
} 
