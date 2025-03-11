import { useStoryblokBridge as useSbBridge } from '@storyblok/js'

export const useStoryblokBridge = (storyId: number, ref: Ref) => {
  const { storyblok } = useAppConfig()
  const { editor } = storyblok

  onMounted(async () => {
    if (editor && !ref.value) return
    useSbBridge(storyId, d => {
      ref.value = d
    })
  })
}
