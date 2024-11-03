import { useI18n } from 'vue-i18n'

export const useLocalizedRoute = () => {
  // @ts-expect-error localeProperties might not defined, depending on the i18n setup
  const { locale, localeProperties } = useI18n()

  const iso = computed(() => localeProperties.value.language?.toLowerCase())
  const pathRegExp = computed(() => new RegExp(`^(/)*(${iso.value}|${locale.value})(/)`))

  const transformPath = (path: string) => {
    return path.replace(pathRegExp.value, `/${locale.value}/`)
  }

  const removePath = (path: string, trailingSlash = false) => {
    return path.replace(pathRegExp.value, trailingSlash ? '/' : '')
  }

  return { transformPath, removePath }
}

export default useLocalizedRoute
