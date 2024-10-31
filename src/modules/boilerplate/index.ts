import {
  defineNuxtModule,
  addImports,
  createResolver,
  addImportsDir,
  addComponentsDir,
  addTypeTemplate,
  installModule,
} from '@nuxt/kit'

export interface ModuleOptions {
  storyblok?: {
    apiKey?: string
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
        console.error('The "storyblok.apiUrl" option is required in @cewald/nuxt-boilerplate-module configuration.')
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
        path: resolve('../../Components/Storyblok'),
        prefix: 'Sb',
        global: true,
      })

      addTypeTemplate({
        filename: 'types/storyblok.components.d.ts',
        src: resolve('./runtime/storyblok/types/storyblok.components.d.ts'),
      })
    }

    /*
     * Add /shared setup
     */
    addImportsDir(resolve('./runtime/shared/utils'))
  },
})
