import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cleanupSVG, importDirectory, isEmptyColor, parseColors, runSVGO } from '@iconify/tools'
import type { IconifyJSON } from '@iconify/types'
import { getIcons, getIconsCSS, stringToIcon } from '@iconify/utils'

/**
 * Script configuration
 */
interface BundleScriptCustomSVGConfig {
  dir: string
  monotone: boolean
  prefix: string
}

interface BundleScriptCustomJSONConfig {
  filename: string
  icons?: string[]
}

interface BundleScriptConfig {
  svg?: BundleScriptCustomSVGConfig[]
  icons?: string[]
  json?: (string | BundleScriptCustomJSONConfig)[]
}

const sources: BundleScriptConfig = {
  svg: [
    // {
    //   dir: 'src/assets/images/iconify-svg',
    //   monotone: true,
    //   prefix: 'custom',
    // },
    // {
    //   dir: 'emojis',
    //   monotone: false,
    //   prefix: 'emoji',
    // },
  ],
  icons: [
    // 'mdi:home',
    // 'mdi:account',
    // 'mdi:login',
    // 'mdi:logout',
    // 'octicon:book-24',
    // 'octicon:code-square-24',
  ],
  json: [
    // Custom JSON file
    // 'json/gg.json',
    {
      filename: '@iconify-json/ri/icons.json',
      icons: [],
    },
    {
      filename: '@iconify-json/bxl/icons.json',
      icons: [
        'facebook',
        'twitter',
        'github',
        'google',
        'linkedin',
      ],
    },
    // Custom file with only few icons
    // {
    //   filename: '@iconify-json/line-md/icons.json',
    //   icons: [
    //     'home-twotone-alt',
    //     'github',
    //     'document-list',
    //     'document-code',
    //     'image-twotone',
    //   ],
    // },
  ],
}

// Définir __dirname pour les modules ES
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// File to save bundle to
const target = join(__dirname, 'icons.css')

/**
 * Do stuff!
 */
(async function () {
  // Create directory for output if missing
  const dir = dirname(target)
  try {
    await fs.mkdir(dir, {
      recursive: true,
    })
  }
  catch (err) {
    //
  }

  const allIcons: IconifyJSON[] = []

  /**
   * Convert sources.icons to sources.json
   */
  if (sources.icons && sources.icons.length) {
    const sourcesJSON = sources.json ? sources.json : (sources.json = [])
    const organizedList = organizeIconsList(sources.icons)
    for (const prefix in organizedList) {
      sourcesJSON.push({
        filename: `@iconify-json/${prefix}/icons.json`,
        icons: organizedList[prefix],
      })
    }
  }

  /**
   * Bundle JSON files and collect icons
   */
  if (sources.json) {
    for (let i = 0; i < sources.json.length; i++) {
      const item = sources.json[i]
      const filename = typeof item === 'string' ? item : item.filename
      // Utiliser import dynamique au lieu de require
      const content = (await import(filename)).default as IconifyJSON
      if (typeof item !== 'string' && item.icons?.length) {
        const filteredContent = getIcons(content, item.icons)
        if (!filteredContent)
          throw new Error(`Cannot find required icons in ${filename}`)
        allIcons.push(filteredContent)
      }
      else {
        allIcons.push(content)
      }
    }
  }

  /**
   * Bundle custom SVG icons and collect icons
   */
  if (sources.svg) {
    for (let i = 0; i < sources.svg.length; i++) {
      const source = sources.svg[i]
      const iconSet = await importDirectory(source.dir, {
        prefix: source.prefix,
      })
      await iconSet.forEach(async (name, type) => {
        if (type !== 'icon')
          return
        const svg = iconSet.toSVG(name)
        if (!svg) {
          iconSet.remove(name)
          return
        }
        try {
          await cleanupSVG(svg)
          if (source.monotone) {
            await parseColors(svg, {
              defaultColor: 'currentColor',
              callback: (attr, colorStr, color) => {
                return !color || isEmptyColor(color) ? colorStr : 'currentColor'
              },
            })
          }
          await runSVGO(svg)
        }
        catch (err) {
          console.error(`Error parsing ${name} from ${source.dir}:`, err)
          iconSet.remove(name)
          return
        }
        iconSet.fromSVG(name, svg)
      })
      allIcons.push(iconSet.export())
    }
  }

  // Generate CSS from collected icons
  const cssContent = allIcons
    .map(iconSet => getIconsCSS(
      iconSet,
      Object.keys(iconSet.icons),
      { iconSelector: '.{prefix}-{name}' },
    ))
    .join('\n')

  // Save the CSS to a file
  await fs.writeFile(target, cssContent, 'utf8')
  console.log(`Saved CSS to ${target}!`)
})().catch((err: unknown) => {
  console.error(err)
})

/**
 * Sort icon names by prefix
 */
function organizeIconsList(icons: string[]): Record<string, string[]> {
  const sorted: Record<string, string[]> = Object.create(null)
  icons.forEach(icon => {
    const item = stringToIcon(icon)
    if (!item)
      return
    const prefix = item.prefix
    const prefixList = sorted[prefix] ? sorted[prefix] : (sorted[prefix] = [])
    const name = item.name
    if (!prefixList.includes(name))
      prefixList.push(name)
  })
  return sorted
}
