import {
  addComponentsDir,
  addImports,
  addImportsDir,
  addImportsSources,
  createResolver,
  defineNuxtModule,
  extendViteConfig,
  installModule,
} from '@nuxt/kit'

export interface ModuleOptions {
  i18n?: boolean
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
  defaults: {
    i18n: true,
    dayjs: {
      defaultDateFormat: 'YYYY-MM-DD',
    },
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    /**
     * Install @nuxtjs/i18n
     */
    if (options.i18n) {
      await installModule('@nuxtjs/i18n')

      addImportsDir(['composables'].map(name => resolve('./runtime/i18n/' + name)))
    }

    Object.assign(nuxt.options.appConfig, { i18n: options.i18n })

    // Mock i18n methods if not installed
    if (!options.i18n) {
      addImportsSources({
        from: resolve('./lib/mocks/i18n'),
        imports: ['useI18n', '$t'],
      })
    }

    /*
     * Add shared setup
     */
    addImportsDir(['composables', 'utils'].map(name => resolve('./runtime/' + name)))

    addComponentsDir({
      path: resolve('./runtime/components'),
      global: true,
    })

    /**
     * Add zod and its types + folder for auto-imports
     */
    addImports({ name: 'z', from: 'zod' })

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
