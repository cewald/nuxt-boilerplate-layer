import svgLoader from 'vite-svg-loader'

export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxtjs/google-fonts',
    '@nuxtjs/fontaine',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
  ],
  ssr: true,

  devtools: { enabled: true },

  css: [ '@/styles/main.scss' ],
  srcDir: 'src',

  devServer: {
    /** @see https://github.com/nuxt/cli/issues/181 */
    host: '0.0.0.0',
  },

  experimental: {
    defaults: {
      nuxtLink: {
        trailingSlash: 'remove',
      },
    },
  },

  compatibilityDate: '2024-10-27',

  vite: {
    plugins: [
      svgLoader(),
    ],
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  googleFonts: {
    families: {
      // 'Fira Code': {
      //   wght: [ 400, 500, 700 ],
      // },
      // 'Noto Serif': {
      //   wght: [ 300, 400 ],
      //   ital: [ 300, 400 ],
      // },
    },
    download: true,
  },

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
})
