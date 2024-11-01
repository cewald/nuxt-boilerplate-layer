<script setup lang="ts">
defineProps<{ link: SbComponentLinkInternal }>()

const { i18n } = useAppConfig()
const LinkComponent = computed(() =>
  i18n === true
    ? resolveComponent('NuxtLinkLocale')
    : resolveComponent('NuxtLink'))
</script>

<template>
  <component
    :is="LinkComponent"
    :to="link.path"
    :aria-label="link.title"
    v-bind="$attrs"
  >
    <slot>{{ link.title }}</slot>
  </component>
</template>
