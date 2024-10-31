<script setup lang="ts">
defineProps<{
  links: (SbComponentLinkExternal | SbComponentLinkInternal | SbComponentLinkMailto)[]
  test?: SbComponentHeadline
}>()
</script>

<template>
  <div>
    <template
      v-for="link in links"
      :key="link._uid"
    >
      <StoryblokLinkComponent :link="link" /> |
    </template>
    <SwitchLocalePathLink locale="de">
      German
    </SwitchLocalePathLink> |
    <SwitchLocalePathLink locale="en">
      English
    </SwitchLocalePathLink>
  </div>
</template>
