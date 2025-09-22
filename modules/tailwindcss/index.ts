import { addImportsDir, createResolver, defineNuxtModule } from '@nuxt/kit'
import { major } from 'semver'

export default defineNuxtModule<{
  enabled?: boolean
  screens?: Record<string, string>
}>({
  meta: {
    name: '@cewald/nuxt-boilerplate-tailwindcss',
    configKey: 'boilerplateTailwindcss',
    compatibility: {
      nuxt: '>=4.0.0',
    },
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
        console.warn(
          '"TailwindCSS" is not installed. Please install it to use @cewald/nuxt-boilerplate-tailwindcss module.',
        )
        return false
      })

    if (!tailwindCssVersion) return
    if (tailwindCssVersion === 3) {
      console.warn(
        '[DEPRECATED] TailwindCSS 3 is deprecated in this versions of @cewald/nuxt-boilerplate-tailwindcss.',
        'Please upgrade to TailwindCSS 4.',
      )
      return
    }

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

    addImportsDir(['composables'].map(name => resolve('./runtime/' + name)))
  },
})
