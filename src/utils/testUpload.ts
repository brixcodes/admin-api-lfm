// Utilitaire pour tester l'upload de fichiers

const API_BASE_URL = 'http://lafaom-mao.vertex-cam.com'

export async function testImageUpload(file: File): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        error: `Erreur ${response.status}: ${errorText}`
      }
    }

    const data = await response.json()
    return {
      success: true,
      data
    }

  } catch (error) {
    return {
      success: false,
      error: `Erreur réseau: ${error}`
    }
  }
}

export async function testDocumentUpload(file: File): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/upload/document`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        error: `Erreur ${response.status}: ${errorText}`
      }
    }

    const data = await response.json()
    return {
      success: true,
      data
    }

  } catch (error) {
    return {
      success: false,
      error: `Erreur réseau: ${error}`
    }
  }
}

// Fonction pour créer un fichier de test
export function createTestImageFile(): File {
  // Créer un canvas avec une image simple
  const canvas = document.createElement('canvas')
  canvas.width = 200
  canvas.height = 200
  
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#4CAF50'
  ctx.fillRect(0, 0, 200, 200)
  ctx.fillStyle = '#fff'
  ctx.font = '20px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('Test Image', 100, 100)
  
  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob!], 'test-image.jpg', { type: 'image/jpeg' })
      resolve(file)
    }, 'image/jpeg', 0.8)
  }) as any
}

// Test complet de l'upload
export async function runUploadTests() {
  console.log('🧪 Test des uploads...')
  
  // Test image
  try {
    const testImage = createTestImageFile()
    const imageResult = await testImageUpload(testImage)
    
    if (imageResult.success) {
      console.log('✅ Upload image réussi:', imageResult.data)
    } else {
      console.log('❌ Upload image échoué:', imageResult.error)
    }
  } catch (err) {
    console.log('❌ Erreur test image:', err)
  }
  
  console.log('🏁 Tests terminés')
}
