import { useScroll } from '@vueuse/core'

export function useHideWhileScrolling() {
  const visible = ref(true)

  const { isScrolling, directions, arrivedState, y } = useScroll(document)
  const { top: toTop } = toRefs(directions)
  const { bottom, top } = toRefs(arrivedState)

  watchEffect(() => {
    if (top.value) {
      visible.value = true
      return
    }

    if (isScrolling.value && y.value > 0 && !bottom.value) {
      visible.value = toTop.value
    }
  })

  return { visible, isScrolling, toTop, onTop: top, onBottom: bottom }
}
