export const useI18n = () => {
  return {
    locale: ref('en'),
    localeProperties: ref({ language: 'en-US' }),
    defaultLocale: 'en',
  }
}

export const $t = (key: string) => key

export default useI18n
