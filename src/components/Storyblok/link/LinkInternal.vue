<script setup lang="ts">
defineProps<SbComponentNavigationItemInternal>()

const { i18n } = useAppConfig()
const LinkComponent = computed(() =>
  i18n === true
    ? resolveComponent('NuxtLinkLocale')
    : resolveComponent('NuxtLink'))
</script>

<template>
  <component
    :is="LinkComponent"
    :to="path"
    :aria-label="title"
    v-bind="$attrs"
  >
    <slot>{{ title }}</slot>
  </component>
</template>
