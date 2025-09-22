export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/google-fonts',
    'nuxt-svgo',
    '@chettapong/nuxt-lodash',
    '@nuxtjs/fontaine',
    '@pinia/nuxt',
  ],
  ssr: true,
  devtools: { enabled: true },
  router: {
    options: {
      scrollBehaviorType: 'smooth',
    },
  },
  experimental: {
    defaults: {
      nuxtLink: {
        trailingSlash: 'append',
      },
    },
  },
  compatibilityDate: '2024-10-27',
  googleFonts: {
    download: true,
  },
  lodash: {
    alias: [['merge', 'deepMerge']],
  },
  svgo: {
    autoImportPath: '@/assets/svg',
    componentPrefix: 'Svg',
    customComponent: 'Svg',
  },
})
