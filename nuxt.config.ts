import svgLoader from 'vite-svg-loader'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  srcDir: 'src',
  i18n: {
    strategy: 'prefix',
    defaultLocale: 'en',
    langDir: 'i18n/lang',
    baseUrl: 'https://https://cewald-nuxt-boilerplate.netlify.app',
    locales: [
      { code: 'en', iso: 'en-US', name: 'English', file: 'en-US.json', isCatchallLocale: true },
      { code: 'de', iso: 'de-DE', name: 'German', file: 'de-DE.json' },
    ],
    bundle: {
      fullInstall: false,
    },
  },
  googleFonts: {
    families: {
      'Fira Code': {
        wght: [400, 500, 700],
      },
      'Noto Serif': {
        wght: [300, 400],
        ital: [300, 400],
      },
    },
    download: true,
  },
  vite: {
    plugins: [
      svgLoader(),
    ],
  },
  css: ['@/styles/main.scss'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/google-fonts',
    '@nuxtjs/fontaine',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
  ],
  experimental: {
    defaults: {
      nuxtLink: {
        trailingSlash: 'remove',
      },
    },
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
  devtools: { enabled: true },
  devServer: {
    /** @see https://github.com/nuxt/cli/issues/181 */
    host: '0.0.0.0',
  },
})
