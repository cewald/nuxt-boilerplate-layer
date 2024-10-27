import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { Config } from 'tailwindcss'
import resolveConfig from 'tailwindcss/resolveConfig'

/**
 * Export tailwind configs to appConfig to be able to read TailwindCSS variables as screen sizes
 * inside javascript and Vue without importing the whole TailwindCSS config object and deps.
 * @see https://tailwindcss.com/docs/configuration#referencing-in-javascript
 */
export default defineNuxtModule({
  meta: {
    name: 'TailwindCSSCustom',
    configKey: 'tailwindCSSCustom',
  },
  async setup(o, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const twConfigPath = resolve(nuxt.options.rootDir, 'tailwind.config.js')
    const twConfig: Config = await import(twConfigPath)
      .then(m => m.default).catch(() => {
        throw new Error(`Cannot read TailwindCSS config file at "${twConfigPath}".`)
      })

    const fullConfig = resolveConfig(twConfig)
    const twScreens = { screens: fullConfig.theme.screens }

    Object.assign(nuxt.options.appConfig, twScreens)
  },
})
