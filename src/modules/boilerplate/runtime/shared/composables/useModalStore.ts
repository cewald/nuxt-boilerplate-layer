import { useScrollLock } from '@vueuse/core'

export interface Modal {
  id: string
  component: Component
  scrollLock?: boolean
}

export const useModalStore = defineStore('modal', () => {
  const items = ref<Record<string, Modal>>({})
  const current = ref<Modal | null>()
  const scrollLock = useScrollLock(document)

  const add = (m: Modal) => !items.value[m.id] && (items.value[m.id] = m)

  const toggle = (m?: Modal, value?: boolean) => {
    if (m && current.value?.id && current.value?.id !== m?.id && value === undefined) {
      current.value = items.value[m?.id]
      scrollLock.value = m?.scrollLock ? true : false
      return
    }

    if (m && value) {
      if (!value) {
        current.value = null
        scrollLock.value = false
      } else {
        current.value = items.value[m?.id]
        scrollLock.value = m?.scrollLock ? true : false
      }
      return
    }

    if (current.value || !m) {
      current.value = null
      scrollLock.value = false
    } else {
      current.value = items.value[m?.id]
      scrollLock.value = m?.scrollLock ? true : false
    }
  }

  const toggleById = (id: string, value?: boolean) => items.value[id] && toggle(items.value[id], value)

  return { items, add, toggle, toggleById, current }
})
