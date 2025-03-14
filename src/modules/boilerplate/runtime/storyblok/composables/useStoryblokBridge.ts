import { useStoryblokBridge as useSbBridge, type StoryblokBridgeConfigV2 } from '@storyblok/js'
import type { SbComponents } from '../types/storyblok.components.content'

export const useStoryblokBridge = <T extends SbComponents>(
  ref: Ref<SbStoryData<T> | null>,
  storyId: number,
  options?: StoryblokBridgeConfigV2
) => {
  const { storyblok } = useAppConfig()
  const { editorMode } = storyblok

  const route = useRoute()
  const currentStoryId = computed(() => route.query?._storyblok)

  onMounted(async () => {
    if (!editorMode) return
    useSbBridge(storyId, d => {
      if (!ref) return
      ref.value = d
    }, options)
  })

  return { currentStoryId }
}

export const useStoryblokBridgeCallback = <T extends SbComponents>(
  cb: (r: SbStoryData<T>) => void,
  storyId: number,
  options?: StoryblokBridgeConfigV2
) => {
  const { storyblok } = useAppConfig()
  const { editorMode } = storyblok

  onMounted(async () => {
    if (!editorMode) return
    useSbBridge(storyId, cb, options)
  })
}
