import {
  defineNuxtModule,
  addImports,
  createResolver,
  addImportsDir,
  addComponentsDir,
  addTypeTemplate,
  installModule,
} from '@nuxt/kit'

import { transformTypesToGlobal } from './transformTypesToGlobal'
import { sbComponentsToTypesFactory } from './fetchSbComponentTypes'

export interface ModuleOptions {
  storyblok?: {
    apiKey?: string
    oauthToken?: string
    spaceId?: string | number
    fetchTypes?: boolean
    region?: 'eu' | 'us' | 'ca' | 'cn' | 'ap'
  } | false
  tailwindcss?: {
    configFile: string
  }
  i18n?: boolean
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
      region: 'eu',
      fetchTypes: true,
    },
    tailwindcss: {
      configFile: 'tailwind.config.js',
    },
    i18n: false,
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    /**
     * Install @nuxtjs/i18n
     */
    if (options.i18n) {
      await installModule('@nuxtjs/i18n')
    }

    Object.assign(nuxt.options.appConfig, { i18n: options.i18n })

    /*
     * Add /storyblok setup
     */
    if (options.storyblok) {
      if (!options.storyblok?.apiKey) {
        console.error('The "storyblok.apiUrl" option is required in @cewald/nuxt-boilerplate configuration.')
      }

      const sbImports = [
        { name: 'RichtextResolver', as: 'RichTextResolver' },
        { name: 'RichtextSchema', as: 'RichTextSchema' },
      ]

      for (const { name, as } of sbImports) {
        addImports({ name, as: 'Sb' + as, from: 'storyblok-js-client' })
      }

      addImportsDir([ 'composables', 'stores' ].map(name => resolve('./runtime/storyblok/' + name)))

      addComponentsDir({
        path: resolve('./runtime/storyblok/components'),
        prefix: 'Sb',
        global: true,
      })

      // Add basic types
      addImportsDir(resolve('./runtime/storyblok/types'))
      addTypeTemplate({
        filename: 'types/storyblok.components.base.d.ts',
        getContents: () => transformTypesToGlobal(resolve('./runtime/storyblok/types/storyblok.components.base.d.ts')),
      })

      // Add dynamic content types
      const { fetchTypes, oauthToken, spaceId, region } = options.storyblok
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
          getContents: () => transformTypesToGlobal(SbContentTypesPath),
        })
      } else {
        console.error('The "storyblok.oauthToken" and "storyblok.spaceId" options'
          + 'are required in @cewald/nuxt-boilerplate configuration.')
      }
    }

    /*
     * Add /shared setup
     */
    addImportsDir(resolve('./runtime/shared/utils'))
  },
})
