<script setup lang="ts">
defineProps<{ link: SbComponentLinkMailto }>()
</script>

<template>
  <a
    :href="`mailto:${link.email}`"
    :aria-label="link.title"
    target="_blank"
  >
    <slot>{{ link.title }}</slot>
  </a>
</template>
