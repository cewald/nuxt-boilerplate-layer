import { useStoryblokBridge } from '@storyblok/js'

export const useSbBridge = (storyId: number, ref: Ref) => {
  const { storyblok } = useAppConfig()
  const { editor } = storyblok

  onMounted(async () => {
    if (editor && !ref.value) return
    useStoryblokBridge(storyId, d => {
      ref.value = d
    })
  })
}
