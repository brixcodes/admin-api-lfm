import { createI18n } from 'vue-i18n'

function detectLocale() {
  const nav = (navigator?.language || navigator?.languages?.[0] || 'en').toLowerCase()
  if (nav.startsWith('fr')) return 'fr'
  if (nav.startsWith('en')) return 'en'
  return 'en'
}

// Charge toutes les locales JSON présentes dans src/locales
const localeModules = import.meta.glob('../locales/*.json', { eager: true }) as Record<string, any>
const messages: Record<string, any> = {}
for (const path in localeModules) {
  const match = path.match(/([A-Za-z-]+)\.json$/)
  if (match) messages[match[1]] = localeModules[path].default
}

const saved = localStorage.getItem('locale')
const locale = (saved || detectLocale()) as 'fr' | 'en'

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale,
  fallbackLocale: 'en',
  messages,
})

export default i18n

