import {
  addComponentsDir,
  addImports,
  addImportsDir,
  addImportsSources,
  createResolver,
  defineNuxtModule,
  extendViteConfig,
} from '@nuxt/kit'

export interface ModuleOptions {
  dayjs?: {
    defaultDateFormat: string
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@cewald/nuxt-boilerplate-base',
    configKey: 'boilerplate',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },
  moduleDependencies: {
    '@nuxtjs/i18n': {
      optional: true,
    },
    '@nuxt/image': {
      optional: true,
    },
  },
  defaults: {
    dayjs: {
      defaultDateFormat: 'YYYY-MM-DD',
    },
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.hook('modules:done', async () => {
      /**
       * Install @nuxtjs/i18n composables if module is installed
       */
      const hasI18nModule = nuxt.options._installedModules.some(m => m.meta.name === '@nuxtjs/i18n')
      if (hasI18nModule) {
        addImportsDir(['composables'].map(name => resolve('./runtime/i18n/' + name)))
      } else {
        // Mock i18n methods if not installed
        addImportsSources({
          from: resolve('./lib/mocks/i18n'),
          imports: ['useI18n', '$t'],
        })
      }

      Object.assign(nuxt.options.appConfig, { i18n: hasI18nModule })
    })

    /*
     * Add shared setup
     */
    addImportsDir(['composables', 'utils'].map(name => resolve('./runtime/' + name)))

    addComponentsDir({
      path: resolve('./runtime/components'),
      global: true,
    })

    /**
     * Add zod and its types + folder for auto-imports.
     * There is a name collision the types of Zod that are also auto-imported
     * as "z". To prevent this, the types are imported as "Z" (capitalized).
     */
    addImports([
      { name: 'z', as: 'z', from: 'zod', type: false },
      { name: 'z', as: 'Z', from: 'zod', type: true },
    ])

    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ types: 'zod' })
    })

    addImportsDir(resolve(nuxt.options.srcDir, 'schemas'))

    /**
     * This is to prevent an ESM import error for thos libs
     */
    extendViteConfig(c => {
      c.optimizeDeps = c.optimizeDeps || {}
      c.optimizeDeps.include = c.optimizeDeps.include || []
      c.optimizeDeps.include.push('dayjs', 'dayjs/plugin/customParseFormat', 'fast-deep-equal')
    })

    /**
     * Add dayjs to appConfig
     */
    Object.assign(nuxt.options.appConfig, { dayjs: options.dayjs })
  },
})
