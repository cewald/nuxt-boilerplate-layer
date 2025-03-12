import { useStoryblokBridge as useSbBridge, type StoryblokBridgeConfigV2 } from '@storyblok/js'
import type { SbComponents } from '../types/storyblok.components.content'

export const useStoryblokBridge = <T extends SbComponents>(
  ref: Ref<SbStoryData<T> | null>,
  storyId?: number,
  options?: StoryblokBridgeConfigV2
) => {
  const { storyblok } = useAppConfig()
  const { editor } = storyblok

  const route = useRoute()

  onMounted(async () => {
    if (!editor) return
    const id = storyId || +(route.query?._storyblok || 0)
    useSbBridge(id, d => {
      if (!ref) return
      ref.value = d
    }, options)
  })
}

export const useStoryblokBridgeCallback = <T extends SbComponents>(
  cb: (r: SbStoryData<T>) => void,
  storyId?: number,
  options?: StoryblokBridgeConfigV2
) => {
  const { storyblok } = useAppConfig()
  const { editor } = storyblok

  const route = useRoute()

  onMounted(async () => {
    if (!editor) return
    const id = storyId || +(route.query?._storyblok || 0)
    useSbBridge(id, cb, options)
  })
}
