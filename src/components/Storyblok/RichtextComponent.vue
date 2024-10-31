<script setup lang="ts">
import { h, useAttrs } from 'vue'

const { tag = 'div', content, classes = {} } = defineProps<{
  tag?: keyof HTMLElementTagNameMap
  classes?: RteClasses
  content: SbRichText
}>()

const $attrs = useAttrs()

const { render: richtextRender } = useSbRichTextResolver(classes)
const RenderedRichtext = () => h(tag, { ...$attrs, innerHTML: richtextRender(content) })
</script>

<template>
  <RenderedRichtext />
</template>

<style scoped>
* :deep(p:last-child) {
    @apply mb-0;
}
</style>
