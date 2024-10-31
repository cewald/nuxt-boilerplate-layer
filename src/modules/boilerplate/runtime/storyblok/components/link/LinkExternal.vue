<script setup lang="ts">
import type { SbComponentNavigationItemExternal as Props } from '../../types/storyblok.components'

defineProps<Props>()
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
