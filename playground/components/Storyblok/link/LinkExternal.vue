<script setup lang="ts">
defineProps<SbComponentLinkExternal>()
</script>

<template>
  <a
    :href="path"
    :aria-label="title"
    target="_blank"
    v-bind="$attrs"
  >
    <slot>{{ title }}</slot>
  </a>
</template>
