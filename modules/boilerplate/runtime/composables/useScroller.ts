import type { MaybeElement } from '@vueuse/core'
import type { MaybeRefOrGetter } from 'vue'

import {
  unrefElement,
  useElementHover,
  useElementSize,
  useIntersectionObserver,
  useIntervalFn,
  usePreferredReducedMotion,
  useScroll,
} from '@vueuse/core'

export default function useScroller<T extends MaybeElement>(
  scroller: Ref<MaybeRefOrGetter>,
  scrollItems: Ref<T[]>,
  options: {
    scrollOptions?: ScrollIntoViewOptions | ScrollToOptions
    autoscroll?: boolean
    interval?: number
    autostart?: boolean
    useScrollIntoView?: boolean
  } = {},
) {
  const active = ref(0)
  const reducedMotions = usePreferredReducedMotion()

  const {
    autoscroll = false,
    autostart = true,
    interval = 4000,
    useScrollIntoView,
    scrollOptions: scrollOptionsDefault,
  } = options

  const scrollOptions = computed<ScrollToOptions>(() => ({
    behavior: reducedMotions.value === 'reduce' ? 'instant' : 'smooth',
    ...scrollOptionsDefault,
  }))

  const scrollTo = (index: number, resetTimer = true) => {
    if (active.value === index || !scroller.value || !scrollItems.value) return
    if (resetTimer) pause()

    if (scrollItems.value[index]) {
      if (useScrollIntoView) {
        const element = unrefElement(scrollItems.value[index])
        element?.scrollIntoView(scrollOptions.value)
      } else {
        const xOffset = scrollItems.value.reduce((p, c, i) => {
          const e = unrefElement(c)
          return i < index && e ? p + (e.getClientRects()?.[0]?.width || 0) : p
        }, 0)
        unrefElement(scroller)?.scrollTo({ ...scrollOptions.value, left: xOffset })
      }
    }

    if (resetTimer) resume()
  }

  const nextIndex = computed(() => (active.value === (scrollItems.value?.length || 0) - 1 ? 0 : active.value + 1))
  const prevIndex = computed(() => (active.value === 0 ? (scrollItems.value?.length || 0) - 1 : active.value - 1))

  const next = () => scrollTo(nextIndex.value)
  const prev = () => scrollTo(prevIndex.value)
  const autoNext = () => scrollTo(nextIndex.value, false)

  const { x } = useScroll(scroller)
  const { width } = useElementSize(scroller)
  watchEffect(() => {
    if (!scroller.value) return
    active.value = Math.round(x.value / width.value)
  })

  let { pause, resume } = { pause: () => {}, resume: () => {} }
  onMounted(() => {
    // We need to use it that way, otherwise useIntervalFn will break the SSR during build and gets stuck
    // It seems as if the tryOnScopeDispose function inside the useIntervalFn is not working properly, when
    // used outside a setup function of a SFC.
    const controls = useIntervalFn(autoNext, interval, { immediate: autoscroll && autostart })

    pause = controls.pause
    resume = controls.resume
  })

  const autoscrollActive = ref(autoscroll)
  const toggleAutoscroll = (value?: boolean) => {
    autoscrollActive.value = value ?? !autoscrollActive.value
    if (autoscrollActive.value === true) {
      resume()
    } else {
      pause()
    }
  }

  const startAutoscroll = () => {
    if (!autoscrollActive.value) return
    resume()
  }

  const stopAutoscroll = () => {
    if (!autoscrollActive.value) return
    pause()
  }

  useIntersectionObserver(scroller, elements => {
    if (!autoscroll) return
    if (elements[0]?.isIntersecting) startAutoscroll()
    else stopAutoscroll()
  })

  const scrollerHover = useElementHover(scroller)
  watchEffect(() => {
    if (!autoscroll) return
    if (scrollerHover.value) stopAutoscroll()
    else startAutoscroll()
  })

  return {
    active,
    scrollTo,
    prev,
    next,
    scrollItems,
    scroller,
    toggleAutoscroll,
    isAutoscrollActive: autoscrollActive,
  }
}
