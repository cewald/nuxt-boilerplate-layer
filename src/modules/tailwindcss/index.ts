import { addImports, defineNuxtModule } from '@nuxt/kit'

import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../../tailwind.config.js'

const fullConfig = resolveConfig(tailwindConfig)

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
    Object.assign(nuxt.options.appConfig, {
      screens: fullConfig.theme.screens,
    })

    addImports({
      name: 'default',
      as: 'useScreens',
      from: '~/modules/tailwindcss/composables/useScreens',
    })
  },
})
