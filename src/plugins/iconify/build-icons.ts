import { promises as fs } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function buildIcons() {
  try {
    console.log('Building icons CSS...')

    // For now, create a simple CSS file that works with the existing setup
    // The actual icons are loaded via the @iconify/vue component and iconify JSON data
    const css = `/* Icons CSS - Generated automatically */

/* Base icon styles for Remix Icons */
.iconify {
  display: inline-block;
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
}

/* Remix Icons base class */
[class^="ri-"], [class*=" ri-"] {
  font-family: 'remixicon' !important;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  vertical-align: baseline;
  display: inline-block;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Icon size utilities */
.icon-xs { font-size: 0.75rem; }
.icon-sm { font-size: 0.875rem; }
.icon-md { font-size: 1rem; }
.icon-lg { font-size: 1.25rem; }
.icon-xl { font-size: 1.5rem; }
.icon-2xl { font-size: 2rem; }

/* Icon color utilities */
.icon-primary { color: rgb(var(--v-theme-primary)); }
.icon-secondary { color: rgb(var(--v-theme-secondary)); }
.icon-success { color: rgb(var(--v-theme-success)); }
.icon-warning { color: rgb(var(--v-theme-warning)); }
.icon-error { color: rgb(var(--v-theme-error)); }
.icon-info { color: rgb(var(--v-theme-info)); }

/* Common icon styles */
.icon-spin {
  animation: icon-spin 1s linear infinite;
}

@keyframes icon-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Icon button styles */
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
  cursor: pointer;
}

.icon-btn:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.08);
}

/* Ensure icons work with Vuetify's icon system */
.v-icon.iconify {
  font-size: inherit;
}
`

    // Write CSS to file
    const outputPath = resolve(__dirname, 'icons.css')
    await fs.writeFile(outputPath, css, 'utf8')

    console.log('✅ Generated icons.css with base icon styles')
  } catch (error) {
    console.error('❌ Error building icons:', error)

    // Create a fallback empty CSS file to prevent build errors
    const outputPath = resolve(__dirname, 'icons.css')
    await fs.writeFile(outputPath, '/* Icons CSS - Generated automatically */\n', 'utf8')
    console.log('Created fallback empty icons.css file')
  }
}

buildIcons()
