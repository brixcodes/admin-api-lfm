import { promises as fs } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function buildIcons() {
  try {
    console.log('Building icons CSS...')

    // Generate minimal CSS for Remix Icons compatibility
    // The actual icons are loaded via Remix Icons CSS from CDN
    const css = `/* Icons CSS - Generated automatically for Remix Icons */

/* Ensure Remix Icons work properly with Vuetify */
.v-icon i[class^="ri-"],
.v-icon i[class*=" ri-"] {
  font-size: inherit;
  line-height: 1;
  color: currentColor;
  display: inline-block;
  vertical-align: middle;
}

/* Icon utilities */
.icon-xs { font-size: 0.75rem !important; }
.icon-sm { font-size: 0.875rem !important; }
.icon-md { font-size: 1rem !important; }
.icon-lg { font-size: 1.25rem !important; }
.icon-xl { font-size: 1.5rem !important; }
.icon-2xl { font-size: 2rem !important; }

/* Animation utilities */
.icon-spin {
  animation: icon-spin 1s linear infinite;
}

@keyframes icon-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Navigation icon styles */
.nav-item-icon {
  margin-inline-end: 0.75rem;
  font-size: 1.375rem;
}

/* Responsive icon sizes */
@media (max-width: 768px) {
  .nav-item-icon {
    font-size: 1.25rem;
  }
}
`

    // Write CSS to file
    const outputPath = resolve(__dirname, 'icons.css')
    await fs.writeFile(outputPath, css, 'utf8')

    console.log('✅ Generated icons.css with Remix Icons compatibility')
  } catch (error) {
    console.error('❌ Error building icons:', error)

    // Create a fallback empty CSS file to prevent build errors
    const outputPath = resolve(__dirname, 'icons.css')
    await fs.writeFile(outputPath, '/* Icons CSS - Generated automatically */\n', 'utf8')
    console.log('Created fallback empty icons.css file')
  }
}

buildIcons()
