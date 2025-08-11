// Utilitaire pour tester la connectivité de l'API

const API_BASE_URL = 'https://lafaom-mao.vertex-cam.com'

export async function testApiConnection(): Promise<{
  isConnected: boolean
  message: string
  responseTime?: number
}> {
  const startTime = Date.now()
  
  try {
    const response = await fetch(`${API_BASE_URL}/actualites?page=1&per_page=1`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Timeout après 5 secondes
      signal: AbortSignal.timeout(5000)
    })

    const responseTime = Date.now() - startTime

    if (response.ok) {
      return {
        isConnected: true,
        message: 'API connectée et fonctionnelle',
        responseTime
      }
    } else {
      return {
        isConnected: false,
        message: `API accessible mais erreur ${response.status}: ${response.statusText}`,
        responseTime
      }
    }

  } catch (error) {
    const responseTime = Date.now() - startTime

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          isConnected: false,
          message: 'Timeout: L\'API ne répond pas dans les temps',
          responseTime
        }
      }
      
      if (error.message.includes('fetch')) {
        return {
          isConnected: false,
          message: 'Erreur de connexion: API inaccessible',
          responseTime
        }
      }
    }

    return {
      isConnected: false,
      message: `Erreur inconnue: ${error}`,
      responseTime
    }
  }
}

// Fonction pour basculer automatiquement entre API réelle et mock
export async function getActualitesComposable() {
  const apiTest = await testApiConnection()
  
  if (apiTest.isConnected) {
    console.log('✅ API connectée, utilisation de l\'API réelle')
    const { useActualites } = await import('@/composables/useActualites')
    return useActualites
  } else {
    console.log('❌ API non disponible, utilisation des données de test')
    console.log(`Raison: ${apiTest.message}`)
    const { useMockActualites } = await import('@/composables/useMockActualites')
    return useMockActualites
  }
}
