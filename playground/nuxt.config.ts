export default defineNuxtConfig({
  extends: [ '../' ],
  devtools: { enabled: true },
  srcDir: './',
  compatibilityDate: '2024-10-28',
  boilerplate: {
    storyblok: {
      apiKey: import.meta.env.VITE_STORYBLOK_ACCESS_TOKEN,
      oauthToken: import.meta.env.VITE_STORYBLOK_OAUTH_TOKEN,
      spaceId: import.meta.env.VITE_STORYBLOK_SPACE_ID,
    },
    i18n: true,
  },
  i18n: {
    strategy: 'prefix',
    defaultLocale: 'en',
    detectBrowserLanguage: false,
    langDir: 'locales/',
    locales: [
      {
        code: 'en',
        language: 'en-US',
        file: 'en-US.json',
        isCatchallLocale: true,
      },
      {
        code: 'de',
        language: 'de-DE',
        file: 'de-DE.json',
      },
    ],
    bundle: {
      fullInstall: false,
    },
  },
})
