import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import { ApiException, actualitesApi, apiUtils, filesApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

// Types
export interface Actualite {
  id?: number
  titre: string
  slug: string
  categorie: string
  chapeau: string
  contenu_html: string
  image_url: string
  date_publication: string
  date_debut_formation?: string
  date_fin_formation?: string
  document_url?: string
  auteur: string
  utilisateur_id: number
  created_at?: string
  updated_at?: string
  vues?: number
}

export interface ActualitesPagination {
  data: Actualite[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export interface CreateActualitePayload {
  titre: string
  slug: string
  categorie: string
  chapeau: string
  contenu_html: string
  image_url: string
  date_publication: string
  date_debut_formation?: string
  date_fin_formation?: string
  document_url?: string
  auteur: string
  utilisateur_id: number
}

// Supprimé - utilise maintenant le service API

export function useActualites() {
  // Store auth pour récupérer l'utilisateur connecté
  const authStore = useAuthStore()

  const actualites: Ref<Actualite[]> = ref([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const skip = ref(0)
  const limit = ref(12)
  const hasMore = ref(true)

  // État de chargement pour les actions
  const creating = ref(false)
  const updating = ref(false)
  const deleting = ref(false)
  const uploading = ref(false)

  // Récupérer les actualités avec pagination skip/limit
  const fetchActualites = async (reset = true, search = '', categorie = '') => {
    loading.value = true
    error.value = null

    try {
      const params: any = {
        skip: reset ? 0 : skip.value,
        limit: limit.value,
      }

      if (search)
        params.search = search
      if (categorie && categorie !== 'Toutes')
        params.categorie = categorie

      const response = await actualitesApi.getActualites(params)

      // L'API retourne directement un tableau d'actualités
      const newActualites = Array.isArray(response) ? response : []

      if (reset) {
        actualites.value = newActualites
        skip.value = 0
      }
      else {
        actualites.value.push(...newActualites)
      }

      // Mettre à jour skip pour le prochain chargement
      skip.value += newActualites.length

      // Vérifier s'il y a plus d'actualités à charger
      hasMore.value = newActualites.length === limit.value
    }
    catch (err) {
      if (err instanceof ApiException)
        error.value = err.message
      else
        error.value = 'Erreur lors du chargement des actualités'

      console.error('Erreur fetchActualites:', err)

      // En cas d'erreur, initialiser avec un tableau vide
      if (reset)
        actualites.value = []
    }
    finally {
      loading.value = false
    }
  }

  // Charger plus d'actualités (pagination paresseuse)
  const loadMore = async (search = '', categorie = '') => {
    if (hasMore.value && !loading.value)
      await fetchActualites(false, search, categorie)
  }

  // Créer une actualité
  const createActualite = async (payload: CreateActualitePayload): Promise<Actualite> => {
    creating.value = true
    error.value = null

    try {
      console.log('=== PAYLOAD REÇU DANS createActualite ===')
      console.log('Payload complet:', payload)
      console.log('Image URL reçue:', payload.image_url)
      console.log('Document URL reçue:', payload.document_url)
      console.log('=== DONNÉES ENVOYÉES À L\'API ===')
      console.log('Payload reçu:', payload)
      console.log('JSON stringifié:', JSON.stringify(payload, null, 2))

      // Désactiver temporairement la validation côté client pour laisser l'API valider
      // const validation = apiUtils.validateActualite(payload)
      // console.log('Erreurs de validation:', validation.errors)
      // if (!validation.isValid)
      //   throw new ApiException(validation.errors.join(', '), 400)

      // Nettoyer le HTML et formater les données pour l'API
      const cleanPayload: any = {
        titre: payload.titre,
        slug: payload.slug,
        categorie: payload.categorie,
        chapeau: payload.chapeau,
        contenu_html: apiUtils.sanitizeHtml(payload.contenu_html),
        date_publication: payload.date_publication,
        auteur: payload.auteur,
        utilisateur_id: authStore.userId || 1, // Utiliser l'ID de l'utilisateur connecté ou 1 par défaut
      }

      // Ajouter les champs optionnels (même s'ils sont vides pour éviter les null)
      cleanPayload.image_url = payload.image_url || ''
      cleanPayload.document_url = payload.document_url || ''

      if (payload.date_debut_formation && payload.date_debut_formation.trim())
        cleanPayload.date_debut_formation = payload.date_debut_formation

      if (payload.date_fin_formation && payload.date_fin_formation.trim())
        cleanPayload.date_fin_formation = payload.date_fin_formation

      console.log('=== CLEAN PAYLOAD FINAL ===')
      console.log('Clean payload:', cleanPayload)
      console.log('JSON stringifié:', JSON.stringify(cleanPayload, null, 2))

      const newActualite = await actualitesApi.createActualite(cleanPayload) as Actualite

      // Ajouter en début de liste
      actualites.value.unshift(newActualite)

      return newActualite
    }
    catch (err) {
      if (err instanceof ApiException)
        error.value = err.message
      else
        error.value = 'Erreur lors de la création de l\'actualité'

      throw err
    }
    finally {
      creating.value = false
    }
  }

  // Mettre à jour une actualité
  const updateActualite = async (id: number, payload: Partial<CreateActualitePayload>): Promise<Actualite> => {
    updating.value = true
    error.value = null

    try {
      // Nettoyer et valider les données
      const cleanPayload: any = {}

      // Copier seulement les champs autorisés pour la modification
      if (payload.titre?.trim())
        cleanPayload.titre = payload.titre.trim()
      if (payload.slug?.trim())
        cleanPayload.slug = payload.slug.trim()
      if (payload.categorie?.trim())
        cleanPayload.categorie = payload.categorie.trim()
      if (payload.chapeau?.trim())
        cleanPayload.chapeau = payload.chapeau.trim()
      if (payload.contenu_html?.trim())
        cleanPayload.contenu_html = apiUtils.sanitizeHtml(payload.contenu_html.trim())

      if (payload.auteur?.trim())
        cleanPayload.auteur = payload.auteur.trim()
      if (payload.date_publication)
        cleanPayload.date_publication = payload.date_publication

      // Champs optionnels
      if (payload.image_url !== undefined)
        cleanPayload.image_url = payload.image_url || ''
      if (payload.document_url !== undefined)
        cleanPayload.document_url = payload.document_url || ''
      if (payload.date_debut_formation)
        cleanPayload.date_debut_formation = payload.date_debut_formation
      if (payload.date_fin_formation)
        cleanPayload.date_fin_formation = payload.date_fin_formation

      console.log('=== UPDATE PAYLOAD ===')
      console.log('Payload original:', payload)
      console.log('Payload nettoyé:', cleanPayload)

      const updatedActualite = await actualitesApi.updateActualite(id, cleanPayload) as Actualite

      // Mettre à jour dans la liste
      const index = actualites.value.findIndex(a => a.id === id)
      if (index !== -1)
        actualites.value[index] = updatedActualite

      return updatedActualite
    }
    catch (err) {
      console.error('Erreur lors de la mise à jour:', err)
      if (err instanceof ApiException)
        error.value = err.message
      else
        error.value = 'Erreur lors de la mise à jour de l\'actualité'

      throw err
    }
    finally {
      updating.value = false
    }
  }

  // Supprimer une actualité
  const deleteActualite = async (id: number): Promise<void> => {
    deleting.value = true
    error.value = null

    try {
      await actualitesApi.deleteActualite(id)

      // Supprimer de la liste
      const index = actualites.value.findIndex(a => a.id === id)
      if (index !== -1)
        actualites.value.splice(index, 1)
    }
    catch (err) {
      if (err instanceof ApiException)
        error.value = err.message
      else
        error.value = 'Erreur lors de la suppression de l\'actualité'

      throw err
    }
    finally {
      deleting.value = false
    }
  }

  // Upload de fichier
  const uploadFile = async (file: File, fileType: 'image' | 'document' = 'image'): Promise<{
    filename: string
    original_filename: string
    url: string
    file_type: string
    size: number
    path: string
  }> => {
    uploading.value = true
    error.value = null

    try {
      // L'API retourne un objet complet avec toutes les informations
      return await filesApi.uploadFile(file, fileType)
    }
    catch (err) {
      if (err instanceof ApiException)
        error.value = err.message
      else
        error.value = 'Erreur lors de l\'upload du fichier'

      throw err
    }
    finally {
      uploading.value = false
    }
  }

  // Computed
  const isEmpty = computed(() => actualites.value.length === 0 && !loading.value)

  // Générer un slug à partir du titre
  const generateSlug = (titre: string): string => {
    return titre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036F]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
      .trim()
      .replace(/\s+/g, '-') // Remplacer espaces par tirets
      .replace(/-+/g, '-') // Éviter les tirets multiples
  }

  return {
    // État
    actualites,
    loading,
    error,
    skip,
    limit,
    creating,
    updating,
    deleting,
    uploading,

    // Computed
    hasMore,
    isEmpty,

    // Méthodes
    fetchActualites,
    loadMore,
    createActualite,
    updateActualite,
    deleteActualite,
    uploadFile,
    generateSlug,
  }
}
