#!/usr/bin/env node

import fs from 'fs'
import pkg from 'glob'
const { glob } = pkg

/**
 * Script pour détecter les textes en dur dans les composants Vue
 * et suggérer des clés de traduction
 */

// Patterns pour détecter les textes en dur
const TEXT_PATTERNS = [
  /title\s*=\s*["']([^"']+)["']/g,
  /label\s*=\s*["']([^"']+)["']/g,
  /placeholder\s*=\s*["']([^"']+)["']/g,
  /:title\s*=\s*["']([^"']+)["']/g,
  /:label\s*=\s*["']([^"']+)["']/g,
  /:placeholder\s*=\s*["']([^"']+)["']/g,
]

// Textes à ignorer (mots courts, nombres, etc.)
const IGNORE_PATTERNS = [
  /^[0-9]+$/,
  /^[a-zA-Z]{1,2}$/,
  /^[^a-zA-Z]*$/,
  /^(ri-|mdi-|fa-)/,
  /^(v-|class|id|style)/,
]

// Textes déjà traduits (à exclure)
const TRANSLATED_KEYS = [
  'nav.dashboard',
  'nav.profile',
  'nav.users',
  'nav.trainings',
  'nav.management',
  'nav.projects',
  'nav.files',
  'nav.infos',
  'nav.logout',
  'nav.search',
  'nav.notifications',
  'login.title',
  'login.subtitle',
  'login.email',
  'login.password',
  'login.remember',
  'login.forgot',
  'login.login',
  'login.loading',
  'login.errorTitle',
  'login.errorMessage',
  'login.createAccount',
  'login.newHere',
  'dashboard.welcome.title',
  'dashboard.welcome.message',
  'dashboard.welcome.actionLabel',
  'dashboard.stats.general',
  'account.details',
  'account.deactivate',
  'account.changePassword',
  'account.twoFactor',
  'account.apiKey',
  'account.apiKeyList',
  'account.recentDevices',
  'register.title',
  'register.subtitle',
  'register.firstName',
  'register.lastName',
  'register.email',
  'register.gender',
  'register.male',
  'register.female',
  'register.role',
  'register.student',
  'register.studentDesc',
  'register.trainer',
  'register.trainerDesc',
  'register.referent',
  'register.referentDesc',
  'register.coordinator',
  'register.coordinatorDesc',
  'register.admin',
  'register.adminDesc',
  'register.register',
  'register.loading',
  'register.errorTitle',
  'register.errorMessage',
  'register.alreadyHaveAccount',
  'register.login',
  'error.notFound',
  'error.notFoundMessage',
  'common.save',
  'common.cancel',
  'common.delete',
  'common.edit',
  'common.add',
  'common.search',
  'common.filter',
  'common.sort',
  'common.loading',
  'common.noData',
  'common.actions',
  'common.status',
  'common.date',
  'common.name',
  'common.description',
  'common.type',
  'common.amount',
  'common.currency',
  'common.country',
  'common.language',
  'common.timezone',
  'common.phone',
  'common.address',
  'common.state',
  'common.zipCode',
  'ui.typography.headlines',
  'ui.typography.texts',
  'ui.tables.dessert',
  'ui.tables.calories',
  'ui.tables.fat',
  'ui.tables.carbs',
  'ui.tables.protein',
  'profile.tabs.profile',
  'profile.tabs.security',
  'profile.tabs.notifications',
  'profile.tabs.gen_individual',
  'profile.tabs.gen_ancestry',
  'profile.tabs.gen_health',
  'profile.tabs.gen_education',
  'profile.tabs.gen_pii',
  'system.tabs.users',
  'system.tabs.roles',
  'system.tabs.permissions',
  'system.tabs.journal',
  'gestion.tabs.enrollments',
  'gestion.tabs.payments',
]

function isIgnoredText(text) {
  return IGNORE_PATTERNS.some(pattern => pattern.test(text))
}

function isAlreadyTranslated(text) {
  const key = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '.')
  return TRANSLATED_KEYS.includes(key)
}

function suggestTranslationKey(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '.')
    .trim()
}

async function findUntranslatedTexts() {
  const vueFiles = await glob('src/**/*.vue')
  const results = []

  vueFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8')
    const lines = content.split('\n')
    
    lines.forEach((line, lineNumber) => {
      TEXT_PATTERNS.forEach(pattern => {
        const matches = line.matchAll(pattern)
        for (const match of matches) {
          const text = match[1]
          
          if (text && !isIgnoredText(text) && !isAlreadyTranslated(text)) {
            const suggestedKey = suggestTranslationKey(text)
            results.push({
              file,
              line: lineNumber + 1,
              text,
              suggestedKey,
              originalLine: line.trim()
            })
          }
        }
      })
    })
  })

  return results
}

function generateReport(results) {
  console.log('🔍 Détection des textes non traduits\n')
  
  if (results.length === 0) {
    console.log('✅ Aucun texte non traduit trouvé !')
    return
  }

  console.log(`📊 ${results.length} textes non traduits trouvés :\n`)

  const groupedByFile = {}
  results.forEach(result => {
    if (!groupedByFile[result.file]) {
      groupedByFile[result.file] = []
    }
    groupedByFile[result.file].push(result)
  })

  Object.entries(groupedByFile).forEach(([file, fileResults]) => {
    console.log(`📁 ${file}:`)
    fileResults.forEach(result => {
      console.log(`  Ligne ${result.line}: "${result.text}"`)
      console.log(`  → Clé suggérée: ${result.suggestedKey}`)
      console.log(`  → Ligne: ${result.originalLine}`)
      console.log('')
    })
  })

  console.log('\n💡 Suggestions pour ajouter les traductions :')
  console.log('1. Ajoutez les clés dans src/locales/fr.json et src/locales/en.json')
  console.log('2. Remplacez les textes en dur par $t(\'clé.suggérée\')')
  console.log('3. Utilisez useI18n() dans les composants')
}

// Exécution du script
if (import.meta.url === `file://${process.argv[1]}`) {
  const results = await findUntranslatedTexts()
  generateReport(results)
}

export {
    findUntranslatedTexts, isAlreadyTranslated, isIgnoredText, suggestTranslationKey
}

