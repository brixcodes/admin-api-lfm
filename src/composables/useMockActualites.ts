import { ref, computed } from 'vue'
import type { Actualite, CreateActualitePayload } from '@/composables/useActualites'

// Données de test
const mockActualites: Actualite[] = [
  {
    id: 1,
    titre: "Nouvelle formation en développement web",
    slug: "nouvelle-formation-developpement-web",
    categorie: "Formation",
    chapeau: "L'Institut Lafaom-Mao lance une nouvelle formation complète en développement web moderne avec React, Vue.js et Node.js.",
    contenu_html: `
      <h2>Une formation complète et moderne</h2>
      <p>Cette nouvelle formation couvre tous les aspects du développement web moderne, de la conception d'interfaces utilisateur à la création d'APIs robustes.</p>
      
      <h3>Programme de la formation</h3>
      <ul>
        <li>HTML5, CSS3 et JavaScript ES6+</li>
        <li>Frameworks modernes : React et Vue.js</li>
        <li>Développement backend avec Node.js</li>
        <li>Bases de données et APIs REST</li>
        <li>Déploiement et DevOps</li>
      </ul>
      
      <p>Les étudiants bénéficieront d'un accompagnement personnalisé et de projets pratiques en entreprise.</p>
    `,
    image_url: "https://picsum.photos/800/400?random=1",
    date_publication: "2025-08-10",
    date_debut_formation: "2025-09-15",
    date_fin_formation: "2025-12-15",
    document_url: "https://example.com/brochure-formation-web.pdf",
    auteur: "Marie Dubois",
    utilisateur_id: 1,
    vues: 245,
    created_at: "2025-08-10T10:00:00Z",
    updated_at: "2025-08-10T10:00:00Z"
  },
  {
    id: 2,
    titre: "Partenariat avec TechCorp pour l'emploi des diplômés",
    slug: "partenariat-techcorp-emploi-diplomes",
    categorie: "Partenariat",
    chapeau: "Un nouveau partenariat stratégique garantit des opportunités d'emploi pour nos diplômés dans le secteur technologique.",
    contenu_html: `
      <h2>Un partenariat stratégique</h2>
      <p>L'Institut Lafaom-Mao est fier d'annoncer son partenariat avec TechCorp, leader dans le domaine des technologies innovantes.</p>
      
      <h3>Avantages pour nos étudiants</h3>
      <ul>
        <li>Stages garantis en entreprise</li>
        <li>Opportunités d'emploi prioritaires</li>
        <li>Mentorat par des professionnels expérimentés</li>
        <li>Projets réels en collaboration</li>
      </ul>
      
      <blockquote>
        "Ce partenariat représente une opportunité unique pour nos étudiants d'intégrer directement le marché du travail avec des compétences recherchées."
      </blockquote>
    `,
    image_url: "https://picsum.photos/800/400?random=2",
    date_publication: "2025-08-08",
    auteur: "Jean Martin",
    utilisateur_id: 2,
    vues: 189,
    created_at: "2025-08-08T14:30:00Z",
    updated_at: "2025-08-08T14:30:00Z"
  },
  {
    id: 3,
    titre: "Journée portes ouvertes - Découvrez nos formations",
    slug: "journee-portes-ouvertes-formations",
    categorie: "Événement",
    chapeau: "Venez découvrir nos formations et rencontrer nos équipes lors de notre journée portes ouvertes le 25 août.",
    contenu_html: `
      <h2>Journée portes ouvertes</h2>
      <p>Nous vous invitons à découvrir l'Institut Lafaom-Mao lors de notre journée portes ouvertes.</p>
      
      <h3>Au programme</h3>
      <ul>
        <li>Présentation des formations</li>
        <li>Visite des locaux et laboratoires</li>
        <li>Rencontre avec les enseignants</li>
        <li>Témoignages d'anciens étudiants</li>
        <li>Sessions d'information sur les débouchés</li>
      </ul>
      
      <p><strong>Date :</strong> 25 août 2025<br>
      <strong>Horaires :</strong> 9h00 - 17h00<br>
      <strong>Lieu :</strong> Campus principal de l'Institut</p>
    `,
    image_url: "https://picsum.photos/800/400?random=3",
    date_publication: "2025-08-05",
    date_debut_formation: "2025-08-25",
    auteur: "Sophie Laurent",
    utilisateur_id: 3,
    vues: 156,
    created_at: "2025-08-05T09:15:00Z",
    updated_at: "2025-08-05T09:15:00Z"
  },
  {
    id: 4,
    titre: "Témoignage : De l'Institut au succès professionnel",
    slug: "temoignage-institut-succes-professionnel",
    categorie: "Témoignage",
    chapeau: "Découvrez le parcours inspirant d'Alexandre, diplômé de notre formation en cybersécurité, aujourd'hui expert en sécurité informatique.",
    contenu_html: `
      <h2>Un parcours inspirant</h2>
      <p>Alexandre Petit, diplômé de notre formation en cybersécurité en 2023, partage son expérience et son parcours professionnel.</p>
      
      <blockquote>
        "La formation à l'Institut Lafaom-Mao m'a donné toutes les clés pour réussir dans le domaine de la cybersécurité. Les enseignants sont des professionnels expérimentés et les projets pratiques m'ont permis d'acquérir une expérience concrète."
      </blockquote>
      
      <h3>Son parcours</h3>
      <ul>
        <li>2022-2023 : Formation cybersécurité à l'Institut</li>
        <li>2023 : Stage chez SecureIT</li>
        <li>2023-2024 : Analyste sécurité junior</li>
        <li>2024-présent : Expert en sécurité informatique</li>
      </ul>
      
      <p>Alexandre encourage les futurs étudiants à rejoindre nos formations pour développer leurs compétences dans un environnement professionnel.</p>
    `,
    image_url: "https://picsum.photos/800/400?random=4",
    date_publication: "2025-08-03",
    auteur: "Alexandre Petit",
    utilisateur_id: 4,
    vues: 98,
    created_at: "2025-08-03T16:45:00Z",
    updated_at: "2025-08-03T16:45:00Z"
  },
  {
    id: 5,
    titre: "Nouveau projet de recherche en intelligence artificielle",
    slug: "nouveau-projet-recherche-intelligence-artificielle",
    categorie: "Projet",
    chapeau: "L'Institut lance un projet de recherche ambitieux sur l'IA appliquée à l'éducation en partenariat avec l'université locale.",
    contenu_html: `
      <h2>Innovation en IA éducative</h2>
      <p>Notre nouveau projet de recherche vise à développer des outils d'intelligence artificielle pour personnaliser l'apprentissage.</p>
      
      <h3>Objectifs du projet</h3>
      <ul>
        <li>Développer des algorithmes d'apprentissage adaptatif</li>
        <li>Créer des assistants pédagogiques intelligents</li>
        <li>Analyser les données d'apprentissage pour optimiser les parcours</li>
        <li>Tester les solutions avec nos étudiants</li>
      </ul>
      
      <p>Ce projet, financé sur 3 ans, implique une équipe de 8 chercheurs et permettra à nos étudiants de participer à des travaux de recherche de pointe.</p>
    `,
    image_url: "https://picsum.photos/800/400?random=5",
    date_publication: "2025-08-01",
    auteur: "Dr. Claire Moreau",
    utilisateur_id: 5,
    vues: 134,
    created_at: "2025-08-01T11:20:00Z",
    updated_at: "2025-08-01T11:20:00Z"
  }
]

export function useMockActualites() {
  const actualites = ref<Actualite[]>([...mockActualites])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const lastPage = ref(1)
  const total = ref(mockActualites.length)
  const perPage = ref(12)

  // États de chargement pour les actions
  const creating = ref(false)
  const updating = ref(false)
  const deleting = ref(false)
  const uploading = ref(false)

  // Simuler un délai réseau
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Récupérer les actualités avec pagination
  const fetchActualites = async (page = 1, search = '', categorie = '') => {
    loading.value = true
    error.value = null

    try {
      await delay(800) // Simuler le temps de chargement

      let filtered = [...mockActualites]

      // Filtre par catégorie
      if (categorie && categorie !== 'Toutes' && categorie !== 'All') {
        filtered = filtered.filter(a => a.categorie === categorie)
      }

      // Filtre par recherche
      if (search.trim()) {
        const query = search.toLowerCase()
        filtered = filtered.filter(a =>
          a.titre.toLowerCase().includes(query) ||
          a.chapeau.toLowerCase().includes(query) ||
          a.auteur.toLowerCase().includes(query)
        )
      }

      // Pagination
      const startIndex = (page - 1) * perPage.value
      const endIndex = startIndex + perPage.value
      const paginatedData = filtered.slice(startIndex, endIndex)

      // Si c'est la première page, remplacer les données
      if (page === 1) {
        actualites.value = paginatedData
      } else {
        // Sinon, ajouter à la liste existante
        actualites.value.push(...paginatedData)
      }

      currentPage.value = page
      lastPage.value = Math.ceil(filtered.length / perPage.value)
      total.value = filtered.length

    } catch (err) {
      error.value = 'Erreur lors du chargement des actualités'
      console.error('Erreur fetchActualites:', err)
      
      if (page === 1) {
        actualites.value = []
      }
    } finally {
      loading.value = false
    }
  }

  // Charger plus d'actualités
  const loadMore = async (search = '', categorie = '') => {
    if (currentPage.value < lastPage.value && !loading.value) {
      await fetchActualites(currentPage.value + 1, search, categorie)
    }
  }

  // Créer une actualité
  const createActualite = async (payload: CreateActualitePayload): Promise<Actualite> => {
    creating.value = true
    error.value = null

    try {
      await delay(1000)

      const newActualite: Actualite = {
        id: Math.max(...mockActualites.map(a => a.id || 0)) + 1,
        ...payload,
        vues: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockActualites.unshift(newActualite)
      actualites.value.unshift(newActualite)
      total.value += 1

      return newActualite

    } catch (err) {
      error.value = 'Erreur lors de la création de l\'actualité'
      throw err
    } finally {
      creating.value = false
    }
  }

  // Mettre à jour une actualité
  const updateActualite = async (id: number, payload: Partial<CreateActualitePayload>): Promise<Actualite> => {
    updating.value = true
    error.value = null

    try {
      await delay(800)

      const index = mockActualites.findIndex(a => a.id === id)
      if (index === -1) {
        throw new Error('Actualité non trouvée')
      }

      const updatedActualite = {
        ...mockActualites[index],
        ...payload,
        updated_at: new Date().toISOString()
      }

      mockActualites[index] = updatedActualite

      const localIndex = actualites.value.findIndex(a => a.id === id)
      if (localIndex !== -1) {
        actualites.value[localIndex] = updatedActualite
      }

      return updatedActualite

    } catch (err) {
      error.value = 'Erreur lors de la mise à jour de l\'actualité'
      throw err
    } finally {
      updating.value = false
    }
  }

  // Supprimer une actualité
  const deleteActualite = async (id: number): Promise<void> => {
    deleting.value = true
    error.value = null

    try {
      await delay(500)

      const mockIndex = mockActualites.findIndex(a => a.id === id)
      if (mockIndex !== -1) {
        mockActualites.splice(mockIndex, 1)
      }

      const localIndex = actualites.value.findIndex(a => a.id === id)
      if (localIndex !== -1) {
        actualites.value.splice(localIndex, 1)
        total.value -= 1
      }

    } catch (err) {
      error.value = 'Erreur lors de la suppression de l\'actualité'
      throw err
    } finally {
      deleting.value = false
    }
  }

  // Upload de fichier (simulé)
  const uploadFile = async (file: File, fileType: 'image' | 'document' = 'image'): Promise<string> => {
    uploading.value = true
    error.value = null

    try {
      await delay(1500)

      // Simuler une URL de fichier uploadé
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()
      const mockUrl = `https://example.com/uploads/${fileType}s/${timestamp}.${extension}`

      return mockUrl

    } catch (err) {
      error.value = 'Erreur lors de l\'upload du fichier'
      throw err
    } finally {
      uploading.value = false
    }
  }

  // Computed
  const hasMore = computed(() => currentPage.value < lastPage.value)
  const isEmpty = computed(() => actualites.value.length === 0 && !loading.value)

  // Générer un slug
  const generateSlug = (titre: string): string => {
    return titre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  return {
    // État
    actualites,
    loading,
    error,
    currentPage,
    lastPage,
    total,
    perPage,
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
