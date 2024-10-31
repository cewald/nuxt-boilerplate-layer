<script setup lang="ts">
import type { SbComponentNavigationItemMailTo as Props } from '../../types/storyblok.components'

defineProps<Props>()
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
