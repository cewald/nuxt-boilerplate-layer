import { storyblokEditable } from '@storyblok/js'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.directive<HTMLElement>('sb-editable', {
    getSSRProps() {
      return {}
    },
    beforeMount(el, binding) {
      const { storyblok } = useAppConfig()
      const { editor } = storyblok

      if (editor && binding.value) {
        const options = storyblokEditable(binding.value)
        if (Object.keys(options).length > 0) {
          el.setAttribute('data-blok-c', options['data-blok-c'] as string)
          el.setAttribute('data-blok-uid', options['data-blok-uid'] as string)
          el.classList.add('storyblok__outline')
        }
      }
    },
  })
})
