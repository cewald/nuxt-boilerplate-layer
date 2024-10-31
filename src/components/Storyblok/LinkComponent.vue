<script setup lang="ts">
const { link } = defineProps<{
  link: SbComponentLink
}>()

const linkMap = {
  link_external: resolveComponent('SbLinkExternal'),
  link_internal: resolveComponent('SbLinkInternal'),
  link_mailto: resolveComponent('SbLinkMailto'),
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
