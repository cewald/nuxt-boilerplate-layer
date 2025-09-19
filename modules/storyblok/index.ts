import {
  addComponentsDir,
  addImports,
  addImportsDir,
  addPlugin,
  addServerScanDir,
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'

import {
  prerenderSbPages,
  sbComponentsToTypesFactory,
  clientFactory as storyblokClient,
  transformTypesToGlobal,
} from './lib'

export interface ModuleOptions {
  apiKey?: string
  draftMode?: boolean
  editorMode?: boolean
  oauthToken?: string
  fetchTypes?: boolean
  region?: 'eu' | 'us' | 'ca' | 'cn' | 'ap'
  prerender?: {
    types: string[]
    aliasMap: Record<string, string[]>
  }
  netlifyBuildHookUrl?: string
  netlifyBuildHookSecret?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@cewald/nuxt-boilerplate-storyblok',
    configKey: 'boilerplateStoryblok',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },
  defaults: {
    draftMode: false,
    editorMode: false,
    region: 'eu',
    fetchTypes: true,
    prerender: {
      types: [],
      aliasMap: {},
    },
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const { apiKey, region, editorMode, draftMode } = options

    /*
     * Add shims if module is not configured
     * This avoids errors in the rest of the app
     * but disables all Storyblok related features
     */
    if (!apiKey) {
      addTypeTemplate(
        {
          filename: 'types/storyblok.components.base.d.ts',
          getContents: () => transformTypesToGlobal(resolve('./runtime/types/storyblok.components.base.d.ts')),
        },
        { nuxt: true, nitro: true },
      )

      addTypeTemplate(
        {
          filename: 'types/storyblok.components.content.d.ts',
          getContents: () => transformTypesToGlobal(resolve('./runtime/types/storyblok.components.content-shim.d.ts')),
        },
        { nuxt: true, nitro: true },
      )

      Object.assign(nuxt.options.appConfig, {
        storyblok: { accessToken: 'unused', spaceId: '', languageCodes: [], region, editorMode, draftMode },
      })

      return
    }

    // Fetch Storyblok spaceId and languageCodes
    const languageCodes: string[] = []
    const api = storyblokClient(apiKey)
    const spaceId = await api
      .get('cdn/spaces/me', { version: 'published' })
      .then(({ data }: { data: { space: { id: number; language_codes: string[] } } }) => {
        languageCodes.push(...data.space.language_codes)
        return data.space.id
      })
      .catch(e => {
        console.error("Couldn't fetch Storyblok space-id:", e.message)
        return undefined
      })

    // Add configs to appConfig
    Object.assign(nuxt.options.appConfig, {
      storyblok: { accessToken: apiKey || '', spaceId, languageCodes, region, editorMode, draftMode },
    })

    // Add dynamic imports
    const sbImports = [
      { name: 'RichtextResolver', as: 'RichTextResolver' },
      { name: 'RichtextSchema', as: 'RichTextSchema' },
    ]

    for (const { name, as } of sbImports) {
      addImports({ name, as: 'Sb' + as, from: 'storyblok-js-client' })
    }

    addImportsDir(['composables', 'stores', 'utils'].map(name => resolve('./runtime/' + name)))

    addComponentsDir({
      path: resolve('./runtime/components'),
      prefix: 'Sb',
      global: true,
    })

    // Add basic types
    addTypeTemplate(
      {
        filename: 'types/storyblok.components.base.d.ts',
        getContents: () => transformTypesToGlobal(resolve('./runtime/types/storyblok.components.base.d.ts')),
      },
      { nuxt: true, nitro: true },
    )

    // Add dynamic content types
    const { fetchTypes, oauthToken } = options
    if (fetchTypes && oauthToken && spaceId) {
      const SbComponents = await sbComponentsToTypesFactory(oauthToken, spaceId, region)
      const SbComponentTypes = await SbComponents.generateTypes().catch(error => {
        console.error('Error fetching Storyblok components:', error)
        return "// Types couldn't be loaded from Storyblok Management API."
      })

      const SbContentTypesFile = 'types/storyblok.components.content.d.ts'
      const SbContentTypesPath = resolve('./runtime/' + SbContentTypesFile)
      SbComponents.addTypesToFile(SbContentTypesPath, SbComponentTypes)

      addTypeTemplate(
        {
          filename: SbContentTypesFile,
          getContents: () => transformTypesToGlobal(SbContentTypesPath, true),
        },
        { nuxt: true, nitro: true },
      )
    } else {
      console.warn(
        'The "storyblok.oauthToken" options ' + 'are required in @cewald/nuxt-boilerplate-layer configuration.',
      )
    }

    // Add prerendering
    await prerenderSbPages(options, nuxt)

    const { prerender, netlifyBuildHookUrl, netlifyBuildHookSecret } = options
    if (prerender && netlifyBuildHookUrl && netlifyBuildHookSecret) {
      // Add server imports
      addServerScanDir(resolve('./runtime/server'))

      // Add Netlify build hook URL
      nuxt.options.runtimeConfig.app = {
        ...nuxt.options.runtimeConfig.app,
        netlifyBuildHookUrl,
        netlifyBuildHookSecret,
      }
    }

    // Disable prerendering for for Storyblok editor mode
    if (editorMode && nuxt.options.routeRules) {
      for (const route in nuxt.options.routeRules) {
        const rule = nuxt.options.routeRules[route]
        if (rule?.prerender === true) {
          rule.prerender = false
        }
      }
    }

    // Add Storyblok editor-directive plugin
    addPlugin({
      src: resolve('./runtime/plugins/editor.ts'),
    })
  },
})
