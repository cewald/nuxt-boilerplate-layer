<script setup lang="ts">
import { useSbRichTextResolver, type RteClasses } from '../composables/useSbRichTextResolver'

const {
  tag = 'div',
  content,
  classes = {},
} = defineProps<{
  tag?: keyof HTMLElementTagNameMap
  classes?: RteClasses
  content: SbRichText
}>()

const $attrs: Record<string, unknown> = useAttrs()
const { i18n, storyblok } = useAppConfig()

const LinkComponent = i18n == true ? resolveComponent('NuxtLinkLocale') : resolveComponent('NuxtLink')

const { render: richtextRender } = useSbRichTextResolver(classes, LinkComponent, storyblok.languageCodes)
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
