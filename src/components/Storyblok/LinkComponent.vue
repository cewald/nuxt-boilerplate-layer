<script setup lang="ts">
const { link } = defineProps<{
  link: SbComponentLink
}>()

const linkMap = {
  link_external: resolveComponent('StoryblockLinkExternal'),
  link_internal: resolveComponent('StoryblockLinkInternal'),
  link_mailto: resolveComponent('StoryblockLinkMailto'),
}

const component = computed(() => {
  return linkMap[link.component as keyof typeof linkMap]
})
</script>

<template>
  <component
    :is="component"
    v-bind="link"
  />
</template>
