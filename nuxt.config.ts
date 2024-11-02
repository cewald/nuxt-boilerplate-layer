import svgLoader from 'vite-svg-loader'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
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
})
