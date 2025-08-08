#!/usr/bin/env node

import fs from 'fs'

/**
 * Script pour vérifier que toutes les clés de traduction utilisées dans les composants
 * sont bien définies dans les fichiers de langue
 */

// Lire les fichiers de traduction
const frTranslations = JSON.parse(fs.readFileSync('src/locales/fr.json', 'utf8'))
const enTranslations = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'))

// Clés de traduction utilisées dans nos composants mis à jour
const usedKeys = [
  // Register page
  'register.welcomeTitle',
  'register.welcomeSubtitle',
  
  // Profile tabs
  'profile.tabs.profile',
  'profile.tabs.security',
  'profile.tabs.notifications',
  'profile.tabs.gen_individual',
  'profile.tabs.gen_ancestry',
  'profile.tabs.gen_health',
  'profile.tabs.gen_education',
  'profile.tabs.gen_pii',
  
  // Account settings
  'account.details',
  'account.uploadPhoto',
  'account.reset',
  'account.saveChanges',
  'account.firstName',
  'account.lastName',
  'account.email',
  'account.organization',
  'account.phone',
  'account.address',
  'account.state',
  'account.zipCode',
  'account.country',
  'account.language',
  'account.timezone',
  'account.currency',
  'account.allowedFormats',
  'account.deactivateTitle',
  'account.deactivateConfirm',
  'account.deactivate',
  'account.placeholders.firstName',
  'account.placeholders.lastName',
  'account.placeholders.email',
  'account.placeholders.organization',
  'account.placeholders.phone',
  'account.placeholders.address',
  'account.placeholders.state',
  'account.placeholders.zipCode',
  'account.placeholders.selectCountry',
  'account.placeholders.selectLanguage',
  'account.placeholders.selectTimezone',
  'account.placeholders.selectCurrency',
  
  // Security
  'security.changePassword',
  'security.currentPassword',
  'security.newPassword',
  'security.confirmPassword',
  'security.passwordRequirements',
  'security.requirements.minLength',
  'security.requirements.lowercase',
  'security.requirements.numberOrSymbol',
  'security.browser',
  'security.device',
  'security.location',
  'security.recentActivity',
  
  // Notifications
  'notifications.recentDevices',
  'notifications.permissionRequest',
  'notifications.requestPermission',
  'notifications.type',
  'notifications.email',
  'notifications.browser',
  'notifications.app',
  'notifications.types.newForYou',
  'notifications.types.accountActivity',
  'notifications.types.newBrowserSignIn',
  'notifications.types.newDeviceLinked',
]

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj)
}

function checkTranslations(translations, language) {
  console.log(`\n🔍 Vérification des traductions ${language.toUpperCase()}:`)
  
  const missing = []
  const found = []
  
  usedKeys.forEach(key => {
    const value = getNestedValue(translations, key)
    if (value) {
      found.push(key)
    } else {
      missing.push(key)
    }
  })
  
  console.log(`✅ Trouvées: ${found.length}`)
  console.log(`❌ Manquantes: ${missing.length}`)
  
  if (missing.length > 0) {
    console.log('\n📝 Clés manquantes:')
    missing.forEach(key => console.log(`  - ${key}`))
  }
  
  return missing.length === 0
}

console.log('🌐 Test des traductions pour les pages de profil')
console.log('=' .repeat(50))

const frOk = checkTranslations(frTranslations, 'français')
const enOk = checkTranslations(enTranslations, 'anglais')

console.log('\n📊 Résumé:')
console.log(`Français: ${frOk ? '✅ OK' : '❌ Erreurs'}`)
console.log(`Anglais: ${enOk ? '✅ OK' : '❌ Erreurs'}`)

if (frOk && enOk) {
  console.log('\n🎉 Toutes les traductions sont correctement définies!')
  process.exit(0)
} else {
  console.log('\n⚠️  Certaines traductions sont manquantes.')
  process.exit(1)
}
