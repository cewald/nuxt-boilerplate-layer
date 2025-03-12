import { useStoryblokBridge as useSbBridge } from '@storyblok/js'
import type { SbComponents } from '../types/storyblok.components.content'

export const useStoryblokBridge = <T extends SbComponents>(ref: Ref<SbStoryData<T> | null>, storyId?: number) => {
  const { storyblok } = useAppConfig()
  const { editor } = storyblok

  const route = useRoute()

  onMounted(async () => {
    if (!editor) return
    const id = storyId || +(route.query?._storyblok || 0)
    useSbBridge(id, d => {
      if (!ref) return
      ref.value = d
    })
  })
}
