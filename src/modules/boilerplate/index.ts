import {
  defineNuxtModule,
  addImports,
  createResolver,
  addImportsDir,
  addImportsSources,
  addComponentsDir,
  addTypeTemplate,
  installModule,
  extendViteConfig,
  addServerScanDir,
  addPlugin,
} from '@nuxt/kit'

import {
  transformTypesToGlobal,
  sbComponentsToTypesFactory,
  prerenderSbPages,
  clientFactory as storyblokClient,
  storyblokInit,
} from './lib'

export interface ModuleOptions {
  storyblok?: {
    apiKey?: string
    editor?: boolean
    oauthToken?: string
    fetchTypes?: boolean
    region?: 'eu' | 'us' | 'ca' | 'cn' | 'ap'
    prerender?: {
      types: string[]
      aliasMap: Record<string, string[]>
    }
    netlifyBuildHookUrl?: string
    netlifyBuildHookSecret?: string
  } | false
  tailwindcss?: {
    configFile: string
  }
  i18n?: boolean
  dayjs?: {
    defaultDateFormat: string
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@cewald/nuxt-boilerplate-module',
    configKey: 'boilerplate',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    storyblok: {
      editor: false,
      region: 'eu',
      fetchTypes: true,
      prerender: {
        types: [],
        aliasMap: {},
      },
    },
    tailwindcss: {
      configFile: 'tailwind.config.js',
    },
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

      addImportsDir([ 'composables' ]
        .map(name => resolve('./runtime/i18n/' + name)))
    }

    Object.assign(nuxt.options.appConfig, { i18n: options.i18n })

    /*
    * Warn if Storyblok is enabled but no API key is provided
    */
    if (options?.storyblok && !options?.storyblok?.apiKey) {
      console.warn('The "storyblok.apiKey" option is required in @cewald/nuxt-boilerplate-layer configuration. '
        + 'Storyblok features will not be installed.')
      console.warn('If you want to disable the Storyblok features, '
        + 'set "boilerplate.storyblok: false" in the module options.')
    }

    /*
    * Add Storyblok setup
    */
    if (options.storyblok) {
      const { apiKey, region, editor } = options.storyblok

      // Fetch Storyblok spaceId and languageCodes
      let spaceId
      const languageCodes: string[] = []
      if (apiKey) {
        const api = storyblokClient(apiKey)
        spaceId = await api.get('cdn/spaces/me')
          .then(({ data }: { data: { space: { id: number, language_codes: string[] } } }) => {
            languageCodes.push(...data.space.language_codes)
            return data.space.id
          })
          .catch(() => {
            console.error('Couldn\'t fetch Storyblok space-id.')
            return undefined
          })
      }

      // Add configs to appConfig
      Object.assign(
        nuxt.options.appConfig,
        { storyblok: { accessToken: apiKey || '', spaceId, languageCodes, region, editor } }
      )

      // Add dynamic imports
      const sbImports = [
        { name: 'RichtextResolver', as: 'RichTextResolver' },
        { name: 'RichtextSchema', as: 'RichTextSchema' },
      ]

      for (const { name, as } of sbImports) {
        addImports({ name, as: 'Sb' + as, from: 'storyblok-js-client' })
      }

      addImportsDir([ 'composables', 'stores', 'utils' ]
        .map(name => resolve('./runtime/storyblok/' + name)))

      addComponentsDir({
        path: resolve('./runtime/storyblok/components'),
        prefix: 'Sb',
        global: true,
      })

      // Add basic types
      addTypeTemplate({
        filename: 'types/storyblok.components.base.d.ts',
        getContents: () => transformTypesToGlobal(resolve('./runtime/storyblok/types/storyblok.components.base.d.ts')),
      })

      // Add dynamic content types
      const { fetchTypes, oauthToken } = options.storyblok
      if (fetchTypes && oauthToken && spaceId) {
        const SbComponents = await sbComponentsToTypesFactory(
          oauthToken,
          spaceId,
          region
        )
        const SbComponentTypes = await SbComponents.generateTypes()
          .catch(error => {
            console.error('Error fetching Storyblok components:', error)
            return '// Types couldn\'t be loaded from Storyblok Management API.'
          })

        const SbContentTypesFile = 'types/storyblok.components.content.d.ts'
        const SbContentTypesPath = resolve('./runtime/storyblok/' + SbContentTypesFile)
        SbComponents.addTypesToFile(SbContentTypesPath, SbComponentTypes)

        addTypeTemplate({
          filename: SbContentTypesFile,
          getContents: () => transformTypesToGlobal(SbContentTypesPath, true),
        })
      } else {
        console.warn('The "storyblok.oauthToken" options '
          + 'are required in @cewald/nuxt-boilerplate-layer configuration.')
      }

      // Add prerendering
      await prerenderSbPages(options, nuxt)

      const { prerender, netlifyBuildHookUrl, netlifyBuildHookSecret } = options.storyblok
      if (prerender && netlifyBuildHookUrl && netlifyBuildHookSecret) {
        // Add server imports
        addServerScanDir(resolve('./runtime/storyblok/server'))

        // Add Netlify build hook URL
        nuxt.options.runtimeConfig.app = {
          ...nuxt.options.runtimeConfig.app,
          netlifyBuildHookUrl,
          netlifyBuildHookSecret,
        }
      }

      // Add Storyblok editor-directive plugin
      addPlugin({
        src: resolve('./runtime/storyblok/plugins/editor.ts'),
      })

      if (editor) {
        storyblokInit({
          bridge: true,
          accessToken: apiKey,
        })
      }
    }

    // Mock i18n methods if not installed
    if (!options.i18n) {
      addImportsSources({
        from: resolve('./lib/mocks/i18n'),
        imports: [ 'useI18n', '$t' ],
      })
    }

    /*
     * Add /shared setup
     */
    addImportsDir([ 'composables', 'utils' ]
      .map(name => resolve('./runtime/shared/' + name)))

    addComponentsDir({
      path: resolve('./runtime/shared/components'),
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
      c.optimizeDeps.include.push('dayjs', 'fast-deep-equal')
    })

    /**
     * Add dayjs to appConfig
     */
    Object.assign(nuxt.options.appConfig, { dayjs: options.dayjs })
  },
})
