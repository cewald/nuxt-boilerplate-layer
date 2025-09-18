<script setup lang="ts">
const { filled = true, fontControlled = false } = defineProps<{
  filled?: boolean
  fontControlled?: boolean
  icon: object
}>()
</script>

<template>
  <component
    :is="icon"
    :class="{
      'mb-0.5 size-4 align-middle': fontControlled,
      'fill-current': !filled,
    }"
  />
</template>
