// Configuration de l'API - utilise le proxy par défaut pour éviter les erreurs CORS
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Types pour les réponses d'erreur
interface ApiError {
  message: string
  errors?: Record<string, string[]>
  detail?: any[] // Pour les erreurs FastAPI
  status?: number
}

// Classe d'erreur personnalisée
export class ApiException extends Error {
  public status: number
  public errors?: any // Accepter tout type d'erreur

  constructor(message: string, status = 500, errors?: any) {
    super(message)
    this.name = 'ApiException'
    this.status = status
    this.errors = errors
  }
}

// Configuration par défaut pour fetch
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}

// Fonction utilitaire pour les appels API
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    // Gestion des erreurs HTTP
    if (!response.ok) {
      let errorData: ApiError

      try {
        errorData = await response.json()
        console.error('Détails de l\'erreur API:', errorData)
      }
      catch {
        errorData = {
          message: `Erreur ${response.status}: ${response.statusText}`,
          status: response.status,
        }
      }

      throw new ApiException(
        errorData.message || `Erreur ${response.status}`,
        response.status,
        errorData.detail || errorData.errors || errorData,
      )
    }

    // Retourner les données JSON
    const text = await response.text()

    // Si la réponse est vide, retourner un objet vide ou tableau selon le contexte
    if (!text.trim())
      return {} as T

    try {
      return JSON.parse(text)
    }
    catch (error) {
      console.error('Erreur de parsing JSON:', error)
      console.error('Réponse reçue:', text)
      throw new ApiException('Réponse invalide du serveur', response.status)
    }
  }
  catch (error) {
    // Re-lancer les erreurs API
    if (error instanceof ApiException)
      throw error

    // Gestion des erreurs réseau
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiException(
        'Erreur de connexion. Vérifiez votre connexion internet.',
        0,
      )
    }

    // Autres erreurs
    throw new ApiException(
      error instanceof Error ? error.message : 'Erreur inconnue',
      500,
    )
  }
}

// API des actualités
export const actualitesApi = {
  // Récupérer les actualités avec pagination
  async getActualites(params: {
    skip?: number
    limit?: number
    search?: string
    categorie?: string
  } = {}) {
    const searchParams = new URLSearchParams()

    // Utiliser skip/limit au lieu de page/per_page pour correspondre à l'API
    if (params.skip !== undefined)
      searchParams.append('skip', params.skip.toString())
    if (params.limit !== undefined)
      searchParams.append('limit', params.limit.toString())
    if (params.search)
      searchParams.append('search', params.search)
    if (params.categorie)
      searchParams.append('categorie', params.categorie)

    const query = searchParams.toString()
    const endpoint = `/actualites${query ? `?${query}` : ''}`

    // L'API retourne directement un tableau d'actualités
    return apiCall(endpoint)
  },

  // Récupérer une actualité par ID
  async getActualite(id: number) {
    return apiCall(`/actualites/${id}`)
  },

  // Créer une actualité
  async createActualite(data: any) {
    console.log('Données envoyées à l\'API:', data)

    return apiCall('/actualites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  },

  // Mettre à jour une actualité
  async updateActualite(id: number, data: any) {
    return apiCall(`/actualites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Supprimer une actualité
  async deleteActualite(id: number) {
    return apiCall(`/actualites/${id}`, {
      method: 'DELETE',
    })
  },
}

// API des fichiers
export const filesApi = {
  // Upload de fichier
  async uploadFile(file: File, fileType: 'image' | 'document' = 'image'): Promise<{
    filename: string
    original_filename: string
    url: string
    file_type: string
    size: number
    path: string
  }> {
    const formData = new FormData()

    formData.append('file', file)

    // Utiliser l'endpoint correct avec le paramètre file_type
    const endpoint = `/files/upload?file_type=${fileType}`

    return apiCall(endpoint, {
      method: 'POST',
      headers: {
        // Ne pas définir Content-Type pour FormData
        Accept: 'application/json',
      },
      body: formData,
    })
  },
}

// Utilitaires
export const apiUtils = {
  // Générer un slug à partir d'un titre
  generateSlug(titre: string): string {
    return titre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036F]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
      .trim()
      .replace(/\s+/g, '-') // Remplacer espaces par tirets
      .replace(/-+/g, '-') // Éviter les tirets multiples
  },

  // Formater une date
  formatDate(dateString: string, options: Intl.DateTimeFormatOptions = {}) {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }

    return new Date(dateString).toLocaleDateString('fr-FR', {
      ...defaultOptions,
      ...options,
    })
  },

  // Obtenir la couleur d'une catégorie
  getCategorieColor(categorie: string): string {
    const colors: Record<string, string> = {
      Formation: 'primary',
      Partenariat: 'success',
      Événement: 'warning',
      Témoignage: 'info',
      Projet: 'secondary',
      Certification: 'error',
      Communication: 'purple',
    }

    return colors[categorie] || 'default'
  },

  // Obtenir une URL d'image avec fallback
  getImageUrl(actualite: { id?: number; image_url?: string }): string {
    return actualite.image_url || `https://picsum.photos/400/250?random=${actualite.id || Math.random()}`
  },

  // Valider les données d'une actualité
  validateActualite(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.titre?.trim())
      errors.push('Le titre est requis')
    if (!data.slug?.trim())
      errors.push('Le slug est requis')
    if (!data.categorie?.trim())
      errors.push('La catégorie est requise')
    if (!data.chapeau?.trim())
      errors.push('Le chapeau est requis')
    if (!data.contenu_html?.trim())
      errors.push('Le contenu est requis')
    if (!data.auteur?.trim())
      errors.push('L\'auteur est requis')
    if (!data.date_publication?.trim())
      errors.push('La date de publication est requise')

    // Validation du slug (format URL)
    if (data.slug && !/^[a-z0-9-]+$/.test(data.slug))
      errors.push('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets')

    // Validation des dates
    if (data.date_publication && isNaN(Date.parse(data.date_publication)))
      errors.push('La date de publication n\'est pas valide')

    if (data.date_debut_formation && isNaN(Date.parse(data.date_debut_formation)))
      errors.push('La date de début de formation n\'est pas valide')

    if (data.date_fin_formation && isNaN(Date.parse(data.date_fin_formation)))
      errors.push('La date de fin de formation n\'est pas valide')

    // Validation des URLs
    if (data.image_url && data.image_url.trim()) {
      try {
        new URL(data.image_url)
      }
      catch {
        errors.push('L\'URL de l\'image n\'est pas valide')
      }
    }

    if (data.document_url && data.document_url.trim()) {
      try {
        new URL(data.document_url)
      }
      catch {
        errors.push('L\'URL du document n\'est pas valide')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  // Nettoyer le HTML (sécurité basique)
  sanitizeHtml(html: string): string {
    // Supprimer les scripts et autres éléments dangereux
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '') // Supprimer les événements inline
      .replace(/javascript:/gi, '') // Supprimer les liens javascript
  },
}

// Export par défaut
export default {
  actualitesApi,
  filesApi,
  apiUtils,
  ApiException,
}
