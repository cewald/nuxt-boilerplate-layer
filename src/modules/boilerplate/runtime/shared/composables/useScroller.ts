import {
  useIntervalFn,
  useIntersectionObserver,
  useElementHover,
  usePreferredReducedMotion,
  unrefElement,
} from '@vueuse/core'
import type { MaybeElement } from '@vueuse/core'
import { scroll } from 'motion'

export default function useScroller<T extends MaybeElement>(
  scroller: Ref<MaybeElement>,
  scrollItems: Ref<T[]>,
  options: {
    scrollOptions?: ScrollIntoViewOptions | ScrollToOptions
    autoscroll?: boolean
    interval?: number
    autostart?: boolean
    useScrollIntoView?: boolean
  } = { }
) {
  const active = ref(0)
  const reducedMotions = usePreferredReducedMotion()

  const {
    autoscroll = false,
    autostart = true,
    interval = 4000,
    useScrollIntoView,
    scrollOptions: scrollOptionsDefault } = options

  const scrollOptions = computed<ScrollToOptions>(() => ({
    behavior: reducedMotions.value === 'reduce' ? 'instant' : 'smooth',
    ...scrollOptionsDefault,
  }))

  const scrollTo = (index: number) => {
    if (active.value === index || !scroller.value || !scrollItems.value) return
    if (scrollItems.value[index]) {
      if (useScrollIntoView) {
        const element = unrefElement(scrollItems.value[index])
        element?.scrollIntoView(scrollOptions.value)
      } else {
        const xOffset = scrollItems.value.reduce((p, c, i) => {
          const e = unrefElement(c)
          return i < index && e ? p + e.getClientRects()[0].width : p
        }, 0)
        unrefElement(scroller)?.scrollTo({ ...scrollOptions.value, left: xOffset })
      }
    }
  }

  const next = () => {
    if (active.value === ((scrollItems.value?.length || 0) - 1)) {
      return scrollTo(0)
    }
    scrollTo(active.value + 1)
  }

  const prev = () => {
    if (active.value === 0) {
      return scrollTo((scrollItems.value?.length || 0) - 1)
    }
    scrollTo(active.value - 1)
  }

  const count = computed(() => scrollItems.value?.length || 0)
  const tresholds = computed(() => Array.from({ length: count.value }, (v, i) => i * (100 / count.value)))

  onMounted(() => {
    if (!scroller.value) return
    scroll(
      (scrollProgress: number) => {
        const progress = scrollProgress * 100
        const current = tresholds.value.reduce((p, c) => progress >= p && progress <= c ? p : c, 0)
        active.value = tresholds.value.findIndex(v => v === current)
      },
      { axis: 'x', container: scroller.value as HTMLElement }
    )
  })

  let { pause, resume } = { pause: () => { }, resume: () => { } }
  onMounted(() => {
    // We need to use it that way, otherwise useIntervalFn will break the SSR during build and gets stuck
    // It seems as if the tryOnScopeDispose function inside the useIntervalFn is not working properly, when
    // used outside a setup function of a SFC.
    const controls = useIntervalFn(
      next,
      interval,
      { immediate: autoscroll && autostart }
    )

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

  useIntersectionObserver(scroller, ([ { isIntersecting } ]) => {
    if (!autoscroll) return
    if (isIntersecting) startAutoscroll()
    else stopAutoscroll()
  })

  const scrollerHover = useElementHover(unrefElement(scroller))
  watchEffect(() => {
    if (!autoscroll) return
    if (scrollerHover.value) stopAutoscroll()
    else startAutoscroll()
  })

  return { active,
    scrollTo,
    prev,
    next,
    scrollItems,
    scroller,
    toggleAutoscroll,
    isAutoscrollActive: autoscrollActive,
  }
}
