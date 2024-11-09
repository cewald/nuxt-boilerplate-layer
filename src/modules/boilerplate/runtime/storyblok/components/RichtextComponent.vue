<script setup lang="ts">
import { h, useAttrs } from 'vue'

const { tag = 'div', content, classes = {} } = defineProps<{
  tag?: keyof HTMLElementTagNameMap
  classes?: RteClasses
  content: SbRichText
}>()

const $attrs = useAttrs()
const { i18n } = useAppConfig()

const LinkComponent = i18n == true
  ? resolveComponent('NuxtLinkLocale')
  : resolveComponent('NuxtLink')

const { render: richtextRender } = useSbRichTextResolver(classes, LinkComponent)
const RenderedRichtext = () => h(tag, { ...$attrs }, richtextRender(content))
</script>

<template>
  <RenderedRichtext />
</template>

<style scoped>
* :deep(p:last-child) {
    @apply mb-0;
}
</style>
