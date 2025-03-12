import { storyblokInit, storyblokEditable } from '@storyblok/js'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(nuxtApp => {
  const { storyblok } = useAppConfig()
  const { editor, accessToken } = storyblok

  if (editor) {
    storyblokInit({
      bridge: editor,
      accessToken,
    })
  }

  nuxtApp.vueApp.directive<HTMLElement>('sb-editable', {
    getSSRProps(binding) {
      if (!editor || !binding.value) return {}
      if (binding.value) {
        const options = storyblokEditable(binding.value)
        if (Object.keys(options).length) {
          return {
            attrs: {
              'data-blok-c': options['data-blok-c'],
              'data-blok-uid': options['data-blok-uid'],
            },
            class: 'storyblok__outline',
          }
        }
      }
    },
    beforeMount(el, binding) {
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
