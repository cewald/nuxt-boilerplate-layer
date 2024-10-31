import { useMediaQuery as useMediaQueryCore, toValue, type ConfigurableWindow } from '@vueuse/core'

export function useScreens() {
  const { screens } = useAppConfig()

  const getMediaQuery = (
    screen: MaybeRefOrGetter<keyof typeof screens>,
    range: 'min' | 'max' = 'min',
    dimension: 'width' | 'height' = 'width'
  ) => {
    const value = toValue(screen)
    return typeof value === 'string' && value in screens
      ? `(${range}-${dimension}: ${screens[value]})`
      : value
  }

  const useMediaQuery: (query: MaybeRefOrGetter<keyof typeof screens>, options?: ConfigurableWindow) => Ref<boolean>
    = (query, options) => {
      const value = toValue(query)
      return useMediaQueryCore(getMediaQuery(value), options)
    }

  const breakpoints = computed(() => Object.keys(screens).map(key => parseInt(screens[key as keyof typeof screens])))

  return { screens, breakpoints, getMediaQuery, useMediaQuery }
}

export default useScreens
