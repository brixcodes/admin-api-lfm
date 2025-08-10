import type { App } from 'vue'

import { createVuetify } from 'vuetify'
import { VBtn } from 'vuetify/components/VBtn'
import defaults from './defaults'
import { icons } from './icons'
import { themes } from './theme'

// Styles

import '@core/scss/template/libs/vuetify/index.scss'
import 'vuetify/styles'

// Fonction pour détecter le thème préféré
function getInitialTheme(): string {
  // Vérifier si on est côté client
  if (typeof window === 'undefined') {
    return 'light'
  }

  // 1. Vérifier le localStorage
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
    return savedTheme
  }

  // 2. Détecter la préférence système
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  // 3. Par défaut : light
  return 'light'
}

export default function (app: App) {
  const vuetify = createVuetify({
    aliases: {
      IconBtn: VBtn,
    },
    defaults,
    icons,
    theme: {
      defaultTheme: getInitialTheme(),
      themes,
    },
  })

  app.use(vuetify)
}
