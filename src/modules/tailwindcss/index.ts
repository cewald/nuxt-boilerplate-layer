import { defineNuxtModule, createResolver, addImportsDir } from '@nuxt/kit'
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
      .then(m => m.default).catch(e => {
        console.debug(`Cannot read TailwindCSS config file at "${twConfigPath}": ` + e.message)
        console.debug('Please make sure you have a valid TailwindCSS config file at the root of your project.')
        return false
      })

    if (!twConfig) return

    const fullConfig = resolveConfig(twConfig)
    const twScreens = { screens: fullConfig.theme.screens }

    Object.assign(nuxt.options.appConfig, twScreens)

    /**
     * Add TailwindCSS custom screens to the TailwindCSS config
     */
    addImportsDir([ 'composables' ].map(name => resolve('./runtime/' + name)))

    /**
     * Add boilerplate files to TailwindCSS config to be able to purge unused classes
     */
    nuxt.hook('tailwindcss:config', c => {
      if (!c.content) return
      const boilerplatePath = resolve('../boilerplate/**/*.{vue,js,jsx,mjs,ts,tsx}')
      if ('files' in c.content) {
        c.content.files.push(boilerplatePath)
      } else if (Array.isArray(c.content)) {
        c.content.push(boilerplatePath)
      }
    })
  },
})
