export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    'nuxt-svgo',
    'nuxt-lodash',
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
  srcDir: 'src',
  compatibilityDate: '2024-10-27',
  vite: {
    // Remove SASS deprecation message
    // @see https://github.com/vitejs/vite/issues/18164
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
  googleFonts: {
    download: true,
  },
  lodash: {
    alias: [ [ 'merge', 'deepMerge' ] ],
  },
  svgo: {
    componentPrefix: 'icon',
    customComponent: 'SvgIcon',
  },
})
