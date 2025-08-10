import { useTheme } from 'vuetify'

export type ThemeMode = 'light' | 'dark'

/**
 * Composable pour gérer le thème de l'application
 */
export function useAppTheme() {
  const { global: globalTheme } = useTheme()

  /**
   * Obtenir le thème actuel
   */
  const getCurrentTheme = (): ThemeMode => {
    return globalTheme.name.value as ThemeMode
  }

  /**
   * Définir le thème et le sauvegarder
   */
  const setTheme = (theme: ThemeMode): void => {
    globalTheme.name.value = theme
    localStorage.setItem('theme', theme)
  }

  /**
   * Basculer entre les thèmes
   */
  const toggleTheme = (): void => {
    const currentTheme = getCurrentTheme()
    const newTheme: ThemeMode = currentTheme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  /**
   * Obtenir le thème sauvegardé ou détecter la préférence système
   */
  const getInitialTheme = (): ThemeMode => {
    // 1. Vérifier le localStorage
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme as ThemeMode
    }
    
    // 2. Détecter la préférence système
    if (typeof window !== 'undefined' && window.matchMedia) {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
      }
    }
    
    // 3. Par défaut : light
    return 'light'
  }

  /**
   * Initialiser le thème au démarrage
   */
  const initializeTheme = (): void => {
    const initialTheme = getInitialTheme()
    setTheme(initialTheme)
  }

  /**
   * Écouter les changements de préférence système
   */
  const watchSystemTheme = (): (() => void) | undefined => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      const handleChange = (e: MediaQueryListEvent) => {
        // Ne changer que si aucun thème n'est sauvegardé
        const savedTheme = localStorage.getItem('theme')
        if (!savedTheme) {
          setTheme(e.matches ? 'dark' : 'light')
        }
      }

      mediaQuery.addEventListener('change', handleChange)

      // Retourner une fonction de nettoyage
      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }

    return undefined
  }

  /**
   * Supprimer le thème sauvegardé (revenir aux préférences système)
   */
  const clearSavedTheme = (): void => {
    localStorage.removeItem('theme')
    const initialTheme = getInitialTheme()
    setTheme(initialTheme)
  }

  return {
    getCurrentTheme,
    setTheme,
    toggleTheme,
    getInitialTheme,
    initializeTheme,
    watchSystemTheme,
    clearSavedTheme,
  }
}
