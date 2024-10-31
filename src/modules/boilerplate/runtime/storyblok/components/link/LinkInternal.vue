<script setup lang="ts">
import { computed, resolveComponent } from 'vue'
import type { SbComponentNavigationItemInternal as Props } from '../../types/storyblok.components'
import { useAppConfig } from '#imports'

defineProps<Props>()

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
