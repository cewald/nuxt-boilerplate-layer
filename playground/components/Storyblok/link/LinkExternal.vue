<script setup lang="ts">
defineProps<{ link: SbComponentLinkExternal }>()
</script>

<template>
  <a
    :href="link.path"
    :aria-label="link.title"
    target="_blank"
    v-bind="$attrs"
  >
    <slot>{{ link.title }}</slot>
  </a>
</template>
