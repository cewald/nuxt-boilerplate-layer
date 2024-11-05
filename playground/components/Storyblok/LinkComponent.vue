<script setup lang="ts">
const { link } = defineProps<{
  link: SbComponentLinkExternal | SbComponentLinkInternal | SbComponentLinkMailto
}>()

const linkMap = {
  link_external: resolveComponent('StoryblokLinkExternal'),
  link_internal: resolveComponent('StoryblokLinkInternal'),
  link_mailto: resolveComponent('StoryblokLinkMailto'),
} as const

const component = computed(() => {
  return linkMap[link.component as keyof typeof linkMap]
})
</script>

<template>
  <component
    :is="component"
    :link="link"
  />
</template>
