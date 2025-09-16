/* eslint-disable @typescript-eslint/ban-ts-comment */

import { defineNuxtModule, createResolver, addImportsDir, installModule } from '@nuxt/kit'
import { major } from 'semver'
import type { Config } from 'tailwindcss'

/**
 * Export tailwind configs to appConfig to be able to read TailwindCSS variables as screen sizes
 * inside javascript and Vue without importing the whole TailwindCSS config object and deps.
 * @see https://tailwindcss.com/docs/configuration#referencing-in-javascript
 */
export default defineNuxtModule<{
  enabled?: boolean
  screens?: Record<string, string>
}>({
  meta: {
    name: 'TailwindCSSCustom',
    configKey: 'tailwindCSSCustom',
  },
  defaults: {
    enabled: true,
    screens: {},
  },
  async setup(o, nuxt) {
    if (!o.enabled) return

    const { resolve } = createResolver(import.meta.url)

    const tailwindCssVersion = await import('tailwindcss/package.json')
      .then(r => {
        return major(r.version)
      })
      .catch(() => {
        console.warn('"tailwindcss" is not installed. Please install it to use TailwindCSSCustom module.')
        return false
      })

    if (!tailwindCssVersion) return

    if (tailwindCssVersion === 3) {
      await installModule('@nuxtjs/tailwindcss')

      const twConfigPath = resolve(nuxt.options.rootDir, 'tailwind.config.js')
      const twConfig: Config = await import(twConfigPath)
        .then(m => m.default)
        .catch(e => {
          console.debug(`Cannot read TailwindCSS config file at "${twConfigPath}": ` + e.message)
          console.debug('Please make sure you have a valid TailwindCSS config file at the root of your project.')
          return false
        })

      if (!twConfig) return

      // @ts-ignore
      const resolveConfig = await import('tailwindcss/resolveConfig').then(m => m.default || m).catch(() => false)
      if (typeof resolveConfig === 'boolean') return

      const fullConfig = resolveConfig(twConfig)
      const twScreens = { screens: fullConfig.theme.screens }

      Object.assign(nuxt.options.appConfig, twScreens)

      // @ts-ignore
      nuxt.hook('tailwindcss:config', c => {
        /**
         * Add boilerplate files to TailwindCSS config to be able to purge unused classes
         */
        if (!c.content) return
        const boilerplatePath = resolve('../boilerplate/**/*.{vue,js,jsx,mjs,ts,tsx}')
        if ('files' in c.content) {
          c.content.files.push(boilerplatePath)
        } else if (Array.isArray(c.content)) {
          c.content.push(boilerplatePath)
        }
      })
    } else if (tailwindCssVersion === 4) {
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

      const tailwindcssPlugin = await import('@tailwindcss/vite').then(m => m.default).catch(() => null)
      if (tailwindcssPlugin) {
        nuxt.options.vite.plugins = nuxt.options.vite.plugins || []
        nuxt.options.vite.plugins.push(tailwindcssPlugin())
      }

      Object.assign(nuxt.options.appConfig, twScreens)
    }

    /**
     * Add TailwindCSS custom screens to the TailwindCSS config
     */
    addImportsDir(['composables'].map(name => resolve('./runtime/' + name)))
  },
})
