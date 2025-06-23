import { defineNuxtModule, createResolver, addImportsDir, installModule } from '@nuxt/kit'
import type { Config } from 'tailwindcss'
import resolveConfig from 'tailwindcss/resolveConfig'

/**
 * Export tailwind configs to appConfig to be able to read TailwindCSS variables as screen sizes
 * inside javascript and Vue without importing the whole TailwindCSS config object and deps.
 * @see https://tailwindcss.com/docs/configuration#referencing-in-javascript
 */
export default defineNuxtModule<{
  version?: '3' | '4' | boolean
  screens?: Record<string, string>
}>({
  meta: {
    name: 'TailwindCSSCustom',
    configKey: 'tailwindCSSCustom',
  },
  defaults: {
    version: '3',
    screens: {},
  },
  async setup(o, nuxt) {
    if (!o.version) return

    const { resolve } = createResolver(import.meta.url)
    if (o.version === '3') {
      await installModule('@nuxtjs/tailwindcss')

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
    } else if (o.version === '4') {
      /**
       * In TailwindCSS 4 we have CSS only configuration so we cant read a config file.
       * We need to add the screens manually to the appConfig to be able to use useScreens().
       */
      const twScreens = {
        screens: {
          'sm': '640px',
          'md': '768px',
          'lg': '1024px',
          'xl': '1280px',
          '2xl': '1536px',
          ...o.screens,
        },
      }
      Object.assign(nuxt.options.appConfig, twScreens)
    }

    /**
     * Add TailwindCSS custom screens to the TailwindCSS config
     */
    addImportsDir([ 'composables' ].map(name => resolve('./runtime/' + name)))
  },
})
