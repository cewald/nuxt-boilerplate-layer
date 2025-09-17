import {
  useBreakpoints as useBreakpointsCore,
  useMediaQuery as useMediaQueryCore,
  type ConfigurableWindow,
} from '@vueuse/core'
import { toValue } from 'vue'

export function useScreens() {
  const { screens } = useAppConfig()

  const getMediaQuery = (
    screen: MaybeRefOrGetter<keyof typeof screens>,
    range: 'min' | 'max' = 'min',
    dimension: 'width' | 'height' = 'width',
  ) => {
    const value = toValue(screen)
    return typeof value === 'string' && value in screens ? `(${range}-${dimension}: ${screens[value]})` : value
  }

  const useMediaQuery: (query: MaybeRefOrGetter<keyof typeof screens>, options?: ConfigurableWindow) => Ref<boolean> = (
    query,
    options,
  ) => {
    const value = toValue(query)
    return useMediaQueryCore(getMediaQuery(value), options)
  }

  const breakpoints = computed(() => Object.keys(screens).map(key => parseInt(screens[key as keyof typeof screens])))

  const useBreakpoints = (options: Parameters<typeof useBreakpointsCore>[1]) => {
    return useBreakpointsCore(screens, options)
  }

  return { screens, breakpoints, getMediaQuery, useMediaQuery, useBreakpoints }
}

export default useScreens
