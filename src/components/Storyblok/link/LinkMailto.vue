<script setup lang="ts">
defineProps<SbComponentNavigationItemMailTo>()
</script>

<template>
  <a
    :href="`mailto:${email}`"
    :aria-label="title"
    target="_blank"
  >
    <slot>{{ title }}</slot>
  </a>
</template>
