<script setup lang="ts">
defineProps<{
  links: SbComponentLink[]
}>()
</script>

<template>
  <div>
    <template
      v-for="link in links"
      :key="link._uid"
    >
      <SbLinkComponent :link="link" /> |
    </template>
    <SwitchLocalePathLink locale="de">
      German
    </SwitchLocalePathLink> |
    <SwitchLocalePathLink locale="en">
      English
    </SwitchLocalePathLink>
  </div>
</template>
