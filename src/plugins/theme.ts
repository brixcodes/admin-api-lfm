import type { App } from 'vue'

export default function (app: App) {
  // Initialiser le thème au démarrage de l'application
  if (typeof window !== 'undefined') {
    // Écouter les changements de préférence système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Ne changer que si aucun thème n'est explicitement sauvegardé
      const savedTheme = localStorage.getItem('theme')
      if (!savedTheme) {
        // Déclencher un événement personnalisé pour notifier le changement
        window.dispatchEvent(new CustomEvent('system-theme-change', {
          detail: { theme: e.matches ? 'dark' : 'light' }
        }))
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    
    // Nettoyer l'écouteur quand l'application est détruite
    app.config.globalProperties.$cleanupThemeListener = () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }
}
